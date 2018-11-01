package casclientwrapper;

/**
 * Exception to be thrown if there was an Error with Cas Login.
 */
public class CasProtocolException extends Exception
{
	public CasProtocolException (String message) 
	{
		super (message);
	}
}