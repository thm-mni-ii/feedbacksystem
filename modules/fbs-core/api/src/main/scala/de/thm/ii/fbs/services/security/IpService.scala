package de.thm.ii.fbs.services.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.security.web.util.matcher.IpAddressMatcher

@Component
class IpService {
  @Value("${services.ip.vpnCidrs}") private var vpnIpRangeString: String = ""
  @Value("${services.ip.localCidrs}") private var localIpRangeString: String = ""

  private def vpnIpRange: Seq[String] = vpnIpRangeString.split(",").filter(str => str.nonEmpty)
  private def localIpRange: Seq[String] = localIpRangeString.split(",").filter(str => str.nonEmpty)

  private def isInCidr(cidr: String, ip: String): Boolean = {
    new IpAddressMatcher(cidr).matches(ip)
  }

  private def ipInCidrs(cirds: Seq[String], ip: String): Boolean =
    cirds.exists(cidr => isInCidr(cidr, ip))

  def isIpInZone(zone: String, ip: String): Boolean =
    zone match {
      case "internet" => true
      case "vpn" => ipInCidrs(vpnIpRange, ip) || ipInCidrs(localIpRange, ip)
      case "local" => ipInCidrs(localIpRange, ip) && !ipInCidrs(vpnIpRange, ip)
    }
}
