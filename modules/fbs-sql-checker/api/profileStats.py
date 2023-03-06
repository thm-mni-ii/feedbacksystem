import pstats
from pstats import SortKey

if __name__ == '__main__':

    p = pstats.Stats('restats')
    #p.strip_dirs().sort_stats(-1).print_stats()
    p.sort_stats(SortKey.TIME).print_stats(10)
    p.print_callees()