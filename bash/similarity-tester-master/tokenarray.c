/*	This file is part of the software similarity tester SIM.
	Written by Dick Grune, Vrije Universiteit, Amsterdam.
	$Id: tokenarray.c,v 1.13 2012-06-08 16:04:30 Gebruiker Exp $
*/

#include	"error.h"
#include	"Malloc.h"
#include	"token.h"
#include	"lang.h"
#include	"tokenarray.h"

#define	TK_START	16384		/* increment of token array size */

Token *Token_Array;			/* to be filled by Malloc() */
static size_t tk_size;			/* size of Token_Array[] */
static size_t tk_free;			/* next free position in Token_Array[]*/

void
Init_Token_Array(void) {
	if (Token_Array) Free(Token_Array);
	tk_size = TK_START;
	Token_Array = (Token *)Malloc(sizeof (Token) * tk_size);
	tk_free = 1;		/* don't use position 0 */
}

void
Store_Token(Token tk) {
	if (tk_free == tk_size) {
		/* allocated array is full; try to increase its size */
		size_t new_size = 2 * tk_size;
		if (new_size < tk_free)
			fatal("internal error: TK_INCR causes numeric overflow");
fprintf (stderr,"X64: Growing Token_Array to 0x%016zx\n", new_size);
		Token *new_array =
			(Token *)TryRealloc(
				(char *)Token_Array, sizeof (Token) * new_size
			);
		if (!new_array) {
			/* we failed */
			fatal("out of memory");
		}
		Token_Array = new_array, tk_size = new_size;
	}

	/* now we are sure there is room enough */
	Token_Array[tk_free++] = tk;
}

size_t
Text_Length(void) {
	return tk_free;
}
