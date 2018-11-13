package de.thm.ii.submissioncheck.cas;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.CookieStore;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.params.ClientPNames;
import org.apache.http.client.params.CookiePolicy;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * The basics of the CAS communication have been obtained from https://github.com/justindancer/android-cas-client/
 * CasClient functions as the basis of the cas login.
 * <p>
 * Class is copied from https://github.com/thm-mni-ii/tals/tree/master/android/app/src/main/java/com/thm/mni/tals
 *
 * @author Johannes Meintrup
 */
public class CasClient {

    private static final String TAG = CasClient.class.getSimpleName();
    private static final String CAS_LOGIN_URL_PART = "login";
    private static final String CAS_TICKET_BEGIN = "ticket=";
    private static final String CAS_SERVICE_URL_PART = "?service=";
    private static final String CAS_LT_BEGIN = "name=\"lt\" value=\"";
    private static final String CAS_EXECUTION_BEGIN = "name=\"execution\" value=\"";

    private HttpClient httpClient;
    private String casBaseURL;

    /**
     *  CAS Login Client performs a login on a CAS Service with a given http client based on the MyUrls class
     * @param httpClient A Java Apache Http Client
     */
    public CasClient(HttpClient httpClient) {
        this(httpClient, MyUrls.CAS_BASE_URL);
    }

    /**
     * CAS Login Client performs a login on a CAS Service with a given http client based on the MyUrls class
     * @param httpClient A Java Apache Http Client
     * @param casBaseUrl CAS Service URL
     */
    public CasClient(HttpClient httpClient, String casBaseUrl) {
        this.httpClient = httpClient;
        this.casBaseURL = casBaseUrl;
    }

    HttpContext context;
    CookieStore cookieStore;

    /**
     * Getter for the cookiestore
     *
     * @return cookieStore instance
     */
    public CookieStore getCookieStore() {
        return cookieStore;
    }


    /**
     * Login method. Logs in using the specified login data, trying to authenticate with the service provided via serviceUrl.
     *
     * @param serviceUrl Service URL as String
     * @param username   CAS Username
     * @param password   CAS Password
     * @return Service Ticket String or null if something went wrong.
     * @throws CasAuthenticationException
     * @throws CasProtocolException
     */
    public String login(String serviceUrl, String username, String password) throws CasAuthenticationException, CasProtocolException {
        String serviceTicket = null;
        // The login method simulates the posting of the CAS login form. The login form contains a unique identifier
        // or "LT" that is only valid for 90s. The method getLTFromLoginForm requests the login form from the cAS
        // and extracts the LT that we need.  Note that the LT is _service specific_ : We need to use an identical
        // serviceUrl when retrieving and posting the login form.
        if (MyDebug.DEBUG) System.out.println(casBaseURL + CAS_LOGIN_URL_PART + CAS_SERVICE_URL_PART + serviceUrl);
        HttpPost httpPost = new HttpPost(casBaseURL + CAS_LOGIN_URL_PART + CAS_SERVICE_URL_PART + serviceUrl);

        cookieStore = new BasicCookieStore();
        httpPost.getParams().setParameter(ClientPNames.COOKIE_POLICY, CookiePolicy.BROWSER_COMPATIBILITY);
        context = new BasicHttpContext();
        context.setAttribute(ClientContext.COOKIE_STORE, cookieStore);
        List<Cookie> cookies;
        if (MyDebug.DEBUG) System.out.println(cookieStore.getCookies());

        TokenContainer tc = getLTFromLoginForm(serviceUrl, context);
        String lt = tc == null ? null : tc.lt;
        String execution = tc == null ? null : tc.execution;

        if (lt == null) {
            if (MyDebug.DEBUG)
                System.out.println("Cannot retrieve LT from CAS. Aborting authentication for '" + username + "'");
            throw new CasProtocolException(String.format("Cannot retrieve LT from CAS. Aborting authentication for '%s'", username));
        } else {
            // Yes, it is necessary to include the serviceUrl as part of the query string. The URL must be
            // identical to that used to get the LT.
            if (MyDebug.DEBUG) System.out.println("POST " + casBaseURL + CAS_LOGIN_URL_PART + "?service=" + serviceUrl);

            try {
                // Add form parameters to request body
                //username=&password=&lt=LT-518398-CbscaOZzjPK5HrOGIUOKiqsHUo2Qny&execution=e2s1&_eventId=submit&
                //	submit=Anmelden
                List<NameValuePair> nvps = new ArrayList<NameValuePair>();
                if (MyDebug.DEBUG) System.out.println("User: " + username + " Pass:" + password);
                nvps.add(new BasicNameValuePair("username", username));
                nvps.add(new BasicNameValuePair("password", password));
                nvps.add(new BasicNameValuePair("lt", lt));
                nvps.add(new BasicNameValuePair("execution", execution));
                nvps.add(new BasicNameValuePair("gateway", "true"));
                nvps.add(new BasicNameValuePair("_eventId", "submit"));
                nvps.add(new BasicNameValuePair("submit", "Anmelden"));

                cookies = cookieStore.getCookies();
                for (Cookie c : cookies) {
                    if (MyDebug.DEBUG) System.out.println("Cookie: " + c);
                }

                httpPost.setEntity(new UrlEncodedFormEntity(nvps));

                // execute post method
                HttpResponse response = httpClient.execute(httpPost, context);
                if (MyDebug.DEBUG)
                    System.out.println("POST RESPONSE STATUS=" + response.getStatusLine().getStatusCode() + " : " + response.getStatusLine().toString());

                boolean validLogin = false;
                cookies = cookieStore.getCookies();
                for (Cookie c : cookies) {
                    if (MyDebug.DEBUG) System.out.println("Cookie: " + c);
                    if (c.getName().equals("CASTGC")) {
                        validLogin = true;
                    }
                }
                if (!validLogin) {
                    if (MyDebug.DEBUG)
                        System.out.println("Cas did not return a TGC. Wrong username/password combination?");
                    throw new CasAuthenticationException("Did not receive TGC from CAS. Wrong username/password combination.");
                }

                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    long len = entity.getContentLength();
                    if (len != -1 && len < 2048) {
                        if (MyDebug.DEBUG) System.out.println(EntityUtils.toString(entity));
                    } else {
                        if (MyDebug.DEBUG) showStream(entity.getContent());
                    }
                } else {
                    if (MyDebug.DEBUG) System.out.println("entity is null!");
                    throw new CasAuthenticationException("Entity from response is null!");
                }
                entity.consumeContent();

                if (MyDebug.DEBUG)
                    System.out.println("POST RESPONSE STATUS=" + response.getStatusLine().getStatusCode() + " : " + response.getStatusLine().toString());

                Header headers[] = response.getHeaders("Location");

                if (MyDebug.DEBUG) System.out.println("Array Headers: " + Arrays.toString(headers));


                if (headers != null && headers.length > 0)
                    serviceTicket = extractServiceTicket(headers[0].getValue());

            } catch (IOException e) {
                if (MyDebug.DEBUG) System.out.println("IOException trying to login : " + e.getMessage());
                throw new CasProtocolException("IOException trying to login : " + e.getMessage());
            }
            return serviceTicket;
        }
    }

    private TokenContainer getLTFromLoginForm(String serviceUrl, HttpContext context) {
        HttpGet httpGet = new HttpGet(casBaseURL + CAS_LOGIN_URL_PART + "?service=" + serviceUrl);
        TokenContainer tc = null;
        try {

            if (MyDebug.DEBUG)
                System.out.println("Ready to get our LT from " + casBaseURL + CAS_LOGIN_URL_PART + "?service=" + serviceUrl);
            HttpResponse response = httpClient.execute(httpGet, context);

            if (response == null) {
                if (MyDebug.DEBUG) System.out.println("Egal");
            }


            if (MyDebug.DEBUG) System.out.println("Response = " + response.getStatusLine().toString());
            if (response.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                if (MyDebug.DEBUG)
                    System.out.println("Could not obtain LT token from CAS: " + response.getStatusLine().getStatusCode() + " / " + response.getStatusLine());
            } else {
                HttpEntity entity = response.getEntity();

                if (entity != null) {
                    tc = extractLt(entity.getContent());
                }
                entity.consumeContent();
                if (MyDebug.DEBUG) System.out.println("LT=" + tc.lt);
                if (MyDebug.DEBUG) System.out.println("EXECUTION=" + tc.execution);
            }
        } catch (ClientProtocolException e) {
            if (MyDebug.DEBUG) System.out.println("Getting LT client protocol exception" + e.getMessage());
        } catch (IOException e) {
            if (MyDebug.DEBUG) System.out.println("Getting LT io exception" + e.getMessage());
        }
        return tc;
    }

    private String extractServiceTicket(String data) {
        String serviceTicket = null;
        int start = data.indexOf(CAS_TICKET_BEGIN);
        if (start > 0) {
            start += CAS_TICKET_BEGIN.length();
            serviceTicket = data.substring(start);
        }
        return serviceTicket;
    }

    private TokenContainer extractLt(InputStream dataStream) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(dataStream));
        TokenContainer tc = new TokenContainer();
        try {
            String line = reader.readLine();
            while (line != null) {
                int start = line.indexOf(CAS_LT_BEGIN);
                if (start >= 0) {
                    start += CAS_LT_BEGIN.length();
                    int end = line.indexOf("\"", start);
                    tc.lt = line.substring(start, end);
                }
                start = line.indexOf(CAS_EXECUTION_BEGIN);
                if (start >= 0) {
                    start += CAS_EXECUTION_BEGIN.length();
                    int end = line.indexOf("\"", start);
                    tc.execution = line.substring(start, end);
                }

                line = reader.readLine();
            }
        } catch (IOException e) {
            if (MyDebug.DEBUG) System.out.println(e.getMessage());
        }
        return tc;
    }

    /**
     * Gets the Token and userid from the InputStream specified.
     * Check the usage in LoginActivity to see when it should be used
     *
     * @param dataStream InputStream to be read from
     * @return JSONObject of the token and userid
     */
    public JSONObject getTokenJSON(InputStream dataStream) {
        if (MyDebug.DEBUG) System.out.println("In method getTokenJSON!");
        BufferedReader reader = new BufferedReader(new InputStreamReader(dataStream));
        try {
            String line = reader.readLine();
            if (MyDebug.DEBUG) System.out.println("getTokenJSON StreamString = "+line);
            return new JSONObject(line);
        } catch (IOException | JSONException e) {
            if (MyDebug.DEBUG) System.out.println(e.getMessage());
            return null;
        }
    }

    /**
     * Debug/Helper method
     */
    private void showStream(InputStream dataStream) throws IOException {
        if (MyDebug.DEBUG) System.out.println("In method showStream!");
        BufferedReader reader = new BufferedReader(new InputStreamReader(dataStream));
        String line = reader.readLine();
        while (line != null) {
            System.out.println(line);
            line = reader.readLine();
        }
        if (MyDebug.DEBUG) System.out.println("Exiting method showStream!");
    }
}