/*	This file is part of the software similarity tester SIM.
	Written by Dick Grune, Vrije Universiteit, Amsterdam.
	$Id: lang.c,v 2.6 2012-09-30 11:55:19 Gebruiker Exp $
*/

/*
	This is a dummy implementation of the  module 'lang'.
	Its actual implementation derives from one of the *lang.l files.
*/

#include	<stdio.h>
#include	<stdlib.h>

#include	"token.h"
#include	"lang.h"

FILE *yyin;

int
yylex(void) {
	abort();
	return 0;
}

void
yystart(void) {
	abort();
}

Token lex_token;
size_t lex_nl_cnt;
size_t lex_tk_cnt;
size_t lex_non_ascii_cnt;
