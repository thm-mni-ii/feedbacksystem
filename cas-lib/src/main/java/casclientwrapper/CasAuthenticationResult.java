package casclientwrapper;


/**
 * Container Class for the Result of the Cas Authentication.
 * Holds Expcetions and/or the returned token and userID from a successfull or unsuccessful Cas Authentication.
 */
public class CasAuthenticationResult {
    private String token;
    private Exception exception;
    private String userId;

    /**
     * Constructs an empty Result.
     */
    public CasAuthenticationResult() {
        this.token = null;
        this.userId = null;
        this.exception = null;
    }

    /**
     * Sets the token of this CasAuthenticationResult
     * @param token to be set
     */
    public void setToken(String token) {
        this.token = token;
    }

    /**
     * Sets the userid of this CasAuthenticationResult
     * @param userId to be set
     */
    public void setUserId(String userId) {
        this.userId = userId;
    }

    /**
     * Sets the Expection that occured.
     * @param exception that occurred.
     */
    public void setException(Exception exception) {
        this.exception = exception;
    }

    /**
     * Gets the token value of the result.
     * @return token
     */
    public String getToken() {
        return token;
    }

    /**
     * Gets the userId of the Result
     * @return userid
     */
    public String getUserId() {
        return userId;
    }

    /**
     * Gets the exception that occurred.
     * @return exception
     */
    public Exception getException() {
        return exception;
    }
}
