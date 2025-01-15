package de.thm.ii.fbs.services.health

/*import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.actuate.health.{Health, ReactiveHealthIndicator}
import org.springframework.jdbc.core.JdbcTemplate
import reactor.core.publisher.Mono

class DatabaseHealthService extends ReactiveHealthIndicator {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  override def health(): Mono[Health] = {
    Mono.just(DB.query("SELECT 1;", (row, _) => row.getInt(1))(jdbc).head match {
      case 1 => new Health.Builder().up.build()
      case _ => new Health.Builder().down().build()
    })
  }
}
*/
