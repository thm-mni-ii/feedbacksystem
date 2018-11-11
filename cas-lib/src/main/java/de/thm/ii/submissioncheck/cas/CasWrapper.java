package de.thm.ii.submissioncheck.cas;

import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.SingleClientConnManager;
import org.apache.http.params.BasicHttpParams;
import javax.net.ssl.HostnameVerifier;

/**
 * CasWrapper uses a CasClient Login library from https://github.com/thm-mni-ii/tals/tree/master/android/app/src/main/java/com/thm/mni/tals
 * and prepare all needs to perform a CAS-login with simply calling the `login` method
 *
 * @author Benjamin Manns
 */
public class CasWrapper {

    private String username;
    private String password;

    private CasClient casclient;

    public CasWrapper(String username, String password) {
        this.password = password;
        this.username = username;
    }

    CasClient getClient() {
        return this.casclient;
    }


    public boolean login() {
        final CasAuthenticationResult casAuthenticationResult = new CasAuthenticationResult();
        SchemeRegistry registry = new SchemeRegistry();
        SingleClientConnManager mgr = new SingleClientConnManager(new BasicHttpParams(), registry);
        final DefaultHttpClient httpClient = new DefaultHttpClient(mgr, new BasicHttpParams());


        HostnameVerifier hostnameVerifier = org.apache.http.conn.ssl.SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER;
        SSLSocketFactory socketFactory = SSLSocketFactory.getSocketFactory();

        socketFactory.setHostnameVerifier((X509HostnameVerifier) hostnameVerifier);

        registry.register(new Scheme("https", socketFactory, 443));
        registry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));


        //HttpClient httpClient = Ht create().setRedirectStrategy(new DefaultRedirectStrategy()).build();
        casclient = new CasClient(httpClient);


        try {
            casclient.login("", username, password);
            return true;
        } catch (CasProtocolException | CasAuthenticationException e) {
            return false;
        }

    }
}
