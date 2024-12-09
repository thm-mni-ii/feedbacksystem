import unittest

from typeguard import typechecked

from api.comparator.sqlparse_comparator import SqlparseComparator


@typechecked
class ComparatorTest(unittest.TestCase):
    def test_compare_simple(self):
        comparator = SqlparseComparator()
        errors = comparator.compare("SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
                           "SELECT username, email, password FROM users WHERE username ILIKE 'test%'")
        assert len(errors) == 0

    def test_compare_shorter(self):
        comparator = SqlparseComparator()
        errors = comparator.compare("SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
                           "SELECT username, email, password FROM users")
        assert len(errors) == 1

    def test_compare_shorter_swap(self):
        comparator = SqlparseComparator()
        errors = comparator.compare("SELECT username, email, password FROM users",
                                    "SELECT username, email, password FROM users WHERE username ILIKE 'test%'",)
        assert len(errors) == 7

    def test_compare_to_long_token(self):
        comparator = SqlparseComparator()
        errors = comparator.compare("SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
                                        "SELECT username, email, password, registration_date FROM users WHERE username ILIKE 'test%'")
        assert len(errors) == 3

    def test_compare_to_short_token(self):
        comparator = SqlparseComparator()
        errors = comparator.compare("SELECT username, email, password FROM users WHERE username ILIKE 'test%'",
                                        "SELECT username, email FROM users WHERE username ILIKE 'test%'")
        assert len(errors) == 1

    def test_compare_with_and(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username ILIKE 'test%' AND email ILIKE '%gmail.com'",
            "SELECT username, email, password FROM users WHERE email ILIKE '%gmail.com' AND username ILIKE 'test%'")
        assert len(errors) != 0

    def test_compare_with_join(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users JOIN post ON users.id = post.user_id",
            "SELECT username, email, password FROM users LEFT JOIN post ON users.id = post.user_id")
        assert len(errors) == 1

    def test_compare_with_sub_query(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username NOT IN (SELECT username FROM blocked_users)",
            "SELECT username, email, password FROM users WHERE username IN (SELECT username FROM blocked_users)")
        assert len(errors) == 1

    def test_compare_with_in_sub_query(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT username, email, password FROM users WHERE username IN (SELECT username FROM blocked_users)",
            "SELECT username, email, password FROM users WHERE username IN (SELECT username FROM followed_users)")
        assert len(errors) == 1

    def test_compare_with_aggregate(self):
        comparator = SqlparseComparator()
        errors = comparator.compare(
            "SELECT registration_day, COUNT(DISTINCT username) FROM users GROUP BY registration_day",
            "SELECT registration_day, COUNT(username) FROM users GROUP BY registration_day")
        assert len(errors) == 1


if __name__ == '__main__':
    unittest.main()
