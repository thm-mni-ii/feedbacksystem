package casclientwrapper;

/**
 * Exception to be thrown if there was an Error with Cas Login.
 */
public class CasAuthenticationException extends Exception 
{
	public CasAuthenticationException (String message) 
	{
		super (message);
	}
}
