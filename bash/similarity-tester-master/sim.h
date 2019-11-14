/*	This file is part of the software similarity tester SIM.
	Written by Dick Grune, Vrije Universiteit, Amsterdam.
	$Id: sim.h,v 2.15 2012-11-28 20:49:52 Gebruiker Exp $
*/

#include	<stdio.h>

extern size_t Min_Run_Size;
extern int Page_Width;
extern FILE *Output_File;
extern FILE *Debug_File;

extern const char *token_name;		/* for possible mod in *lang.l */
extern int Threshold_Percentage;	/* threshold percentage */

extern const char *progname;		/* for error reporting */

extern const char *min_run_string;
extern const char *threshold_string;

extern int is_new_old_separator(const char *s);

/* All output goes through designated files, so we block printf, etc. */
#undef	printf
#define	printf	use_fprintf
#undef	putchar
#define	putchar	use_fprintf
