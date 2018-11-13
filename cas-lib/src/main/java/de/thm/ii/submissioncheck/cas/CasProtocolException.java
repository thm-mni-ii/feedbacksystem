package de.thm.ii.submissioncheck.cas;

/**
 * Exception to be thrown if there was an Error with Cas Login.
 *
 * Class is copied from https://github.com/thm-mni-ii/tals/tree/master/android/app/src/main/java/com/thm/mni/tals
 *
 * @author Johannes Meintrup
 */
public class CasProtocolException extends Exception
{
	public CasProtocolException (String message) 
	{
		super (message);
	}
}