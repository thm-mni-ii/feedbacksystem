
import cProfile
import re
import parse_data_through_checker
import random

from pycallgraph import PyCallGraph
from pycallgraph.output import GraphvizOutput

if __name__ == '__main__':
    #cProfile.run('parse_data_through_checker.parse_data_through_checker("C:/Users/artgr/Desktop/test.json")')
    #with PyCallGraph(output=GraphvizOutput()):
        #parse_data_through_checker.parse_data_through_checker(r"C:\Users\artgr\Desktop\test.json")

    #pr = cProfile.Profile()
    #pr.enable()
    #parse_data_through_checker.parse_data_through_checker()
    #pr.disable()
    #pr.print_stats(sort='time')

    def main():
        parse_data_through_checker.parse_data_through_checker()

    cProfile.run( 'main()','restats')
    #parse_data_through_checker.parse_data_through_checker(r"C:\Users\artgr\Desktop\test.json")