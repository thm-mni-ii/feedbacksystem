import unittest

from typeguard import typechecked

from api.comparator.sqlparse_comparator import SqlparseComparator


@typechecked
class ComparatorTest(unittest.TestCase):
    def test_compare_simple(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
        )
        assert len(errors) == 0

    def test_compare_shorter(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
            "SELECT username, email, password FROM users",
        )
        assert len(errors) == 1

    def test_compare_shorter_swap(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users",
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
        )
        assert len(errors) == 7

    def test_compare_to_long_token(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
            "SELECT username, email, password, registration_date FROM users WHERE username ILIKE 'test%'",
        )
        assert len(errors) == 3

    def test_compare_to_short_token(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
            "SELECT username, email FROM users WHERE username ILIKE 'test%'",
        )
        assert len(errors) == 1

    def test_compare_with_and(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%' AND email ILIKE '%gmail.com'",
            "SELECT username, email, password FROM users WHERE email ILIKE '%gmail.com' AND username ILIKE 'test%'",
        )
        assert len(errors) != 0

    def test_compare_with_join(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users JOIN post ON users.id = post.user_id",
            "SELECT username, email, password FROM users LEFT JOIN post ON users.id = post.user_id",
        )
        assert len(errors) == 1

    def test_compare_with_sub_query(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username NOT IN (SELECT username FROM blocked_users)",
            "SELECT username, email, password FROM users WHERE username IN (SELECT username FROM blocked_users)",
        )
        assert len(errors) == 1

    def test_compare_with_in_sub_query(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username IN (SELECT username FROM blocked_users)",
            "SELECT username, email, password FROM users WHERE username IN (SELECT username FROM followed_users)",
        )
        assert len(errors) == 1

    def test_compare_with_aggregate(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT registration_day, COUNT(DISTINCT username) FROM users GROUP BY registration_day",
            "SELECT registration_day, COUNT(username) FROM users GROUP BY registration_day",
        )
        assert len(errors) == 1

    def test_compare_deep(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT email FROM users WHERE username IN (SELECT username FROM users WHERE registration_date > (SELECT AVG(registraion_date) FROM users))",
            "SELECT email FROM users WHERE username IN (SELECT username FROM users WHERE registration_date > (SELECT MIN(registraion_date) FROM users))",
        )
        assert len(errors) == 1

    def test_compare_much_error(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT email FROM users WHERE username IN (SELECT username FROM users WHERE registration_date > (SELECT AVG(registraion_date) FROM users))",
            "SELECT email FROM users WHERE username IN (SELECT email FROM users WHERE registration_date < (SELECT MAX(registraion_date) FROM users))",
        )
        assert len(errors) == 2

    def test_compare_identifier_list(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, password FROM users",
            "SELECT FROM users",
        )
        assert len(errors) == 2
        assert errors[0].expected == "Select Attributes"

    def test_very_complex_query(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT monat, AVG(tage_bis_erstes_gebot) AS durchschnittliche_tage FROM ( SELECT EXTRACT(MONTH FROM Registriert_am) AS monat, EXTRACT(DAY FROM (MIN(Geboten_am) - Registriert_am)) AS tage_bis_erstes_gebot FROM Gebot g JOIN Kunde k ON g.Bieter = k.KNr GROUP BY Bieter, Registriert_am ) AS tage GROUP BY monat ORDER BY monat;",
            "SELECT monat, AVG(tage_bis_erstes_gebot) AS durchschnittliche_tage FROM ( SELECT EXTRACT(MONTH FROM Registriert_am) AS monat, EXTRACT(DAY FROM (MIN(Geboten_am) - Registriert_am)) AS tage_bis_erstes_gebot FROM Gebot g JOIN Kunde k ON g.Bieter = k.KNr GROUP BY Bieter, Registriert_am ) AS tage GROUP BY monat;"
        )
        assert len(errors) == 2

    def test_with_with(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "WITH (SELECT username FROM blocked_users) AS bu SELECT * FROM bu",
            "WITH (SELECT email FROM blocked_users) AS bu SELECT * FROM bu"
        )
        assert len(errors) == 1

    def test_very_very_complex_query(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT g.Auktion, g.Bieter, g.Geboten_am, g.Gebotspreis FROM Gebot g JOIN Auktion a ON g.Auktion = a.ANr WHERE g.Geboten_am >= a.Eingestellt_am AND g.Geboten_am <= a.Eingestellt_am + INTERVAL '7 days' AND g.Gebotspreis > COALESCE( ( SELECT MAX(g_prev.Gebotspreis) FROM Gebot g_prev WHERE g_prev.Auktion = g.Auktion AND g_prev.Geboten_am < g.Geboten_am ), a.Startpreis ) ORDER BY g.Auktion, g.Geboten_am;",
            "SELECT g.Auktion, g.Bieter, g.Geboten_am, g.Gebotspreis FROM Gebot g JOIN Auktion a ON g.Auktion = a.ANr WHERE g.Geboten_am >= a.Eingestellt_am AND g.Geboten_am <= a.Eingestellt_am + INTERVAL '7 days' AND g.Gebotspreis > COALESCE( ( SELECT MAX(g_prev.Gebotspreis) FROM Gebot g_prev WHERE g_prev.Auktion = g.Auktion AND g_prev.Geboten_am < g.Geboten_am ), a.Startpreis ) ORDER BY g.Geboten_am, g.Auktion;"
        )
        assert len(errors) == 2

    def test_not_null(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username FROM user WHERE banned_at IS NULL",
            "SELECT username FROM user WHERE banned_at IS NOT NULL"
        )
        assert len(errors) == 1

if __name__ == "__main__":
    unittest.main()
