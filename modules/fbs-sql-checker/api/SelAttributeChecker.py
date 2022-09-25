#SelAttributeChecker.py

import ProAttributeChecker as AC
from Parser import *

selectCommands = ["sum", "count", "round", "distinct", "sec_to_time", "avg", "max", "min", "time_to_sec", "like",
                  "between", "div", "year", "mul"]
equals = ["eq", "neq", "gte", "gt", "lt", "lte"]

literal = []

# Returns SelectionAttributes as a list if there is a where
def selectWhere(json_file):
    listTables = []
    if ("where" in json_file):
        isWhere = True
        for val1 in json_file["where"]:
            if (isinstance(json_file["where"][val1], str)):
                if ("." in json_file["where"][val1]):
                    listTables.append(json_file["where"][val1].split(".")[1].lower())
                else:
                    listTables.append(json_file["where"][val1].lower())
            if (isinstance(json_file["where"][val1], dict)):
                for val2 in json_file["where"][val1]:
                    if (isinstance(val2, str)):
                        if ((AC.singleSelectDict(val2) != [])):
                            listTables.extend(AC.singleSelectDict(val2))
                        elif ("." in val2):
                            listTables.append(val2.split(".")[1].lower())
                        else:
                            listTables.append(val2.lower())
            for i in range(len(json_file["where"][val1])):
                if (isinstance(json_file["where"][val1][i], dict)):
                    for val3 in json_file["where"][val1][i]:
                        if (val3 in selectCommands):
                            for val4 in json_file["where"][val1][i][val3]:
                                if (isinstance(val4, str)):
                                    if ("." in val4):
                                        listTables.append(val4.split(".")[1].lower())
                                    else:
                                        listTables.append(val4.lower())
            if (isinstance(json_file["where"][val1], list) and (len(json_file["where"][val1]) > 1)):
                if (isinstance(json_file["where"][val1][1], dict)):
                    if (AC.singleSelectDict(json_file["where"][val1][1]) != []):
                        listTables.extend(AC.singleSelectDict(json_file["where"][val1][1]))
                    if ("literal" in json_file["where"][val1][1]):
                        literal.append(json_file["where"][val1][1]["literal"])
                for elem in json_file["where"][val1]:
                    if (isinstance(elem, str)):
                        if ("." in elem):
                            listTables.append(elem.split(".")[1].lower())
                        else:
                            listTables.append(elem.lower())
            for i in range(len(json_file["where"][val1])):
                if (not isinstance(json_file["where"][val1][i], int)):
                    for elem in json_file["where"][val1][i]:
                        if (elem in equals):
                            if (isinstance(json_file["where"][val1][i][elem], list)):
                                for j in range(len(json_file["where"][val1][i][elem])):
                                    if (isinstance(json_file["where"][val1][i][elem][j], str)):
                                        if ("." in json_file["where"][val1][i][elem][j]):
                                            listTables.append(
                                                json_file["where"][val1][i][elem][j].split(".")[1])
                                        else:
                                            listTables.append(json_file["where"][val1][i][elem][j])
                                    if (isinstance(json_file["where"][val1][i][elem][j], dict)):
                                        for elem1 in json_file["where"][val1][i][elem][j]:
                                            if (elem1 in selectCommands):
                                                if (isinstance(json_file["where"][val1][i][elem][j][elem1], str)):
                                                    if ("." in json_file["where"][val1][i][elem][j][elem1]):
                                                        listTables.append(
                                                            json_file["where"][val1][i][elem][j][elem1].split(".")[
                                                                1])
                                                    else:
                                                        listTables.append(
                                                            json_file["where"][val1][i][elem][j][elem1])
                                            if (elem1 == "literal"):
                                                literal.append(json_file["where"][val1][i][elem][j][elem1])
                                        listTables.extend(AC.singleSelectDict(json_file["where"][val1][i][elem][j]))
                        if (elem == "where"):
                            listTables.extend(selectWhere(json_file["where"][val1][i]))
    return set(listTables)


# returns SelectionAttributes for a statement and uses herefor different arts of sql-statements
def extractSelAttributes(json_file, client):
    whereAttributes = []
    json_file = parse_query(json_file, client)
    try:
        if ((selectWhere(json_file) is not None) and (selectWhere(json_file) != [])):
            whereAttributes.extend([selectWhere(json_file)])
    except Exception as e:
        # print(e)
        whereAttributes = [["Unknown"]]
    if len(whereAttributes) > 0:
        return list(whereAttributes[0])
    else:
        return list(whereAttributes)


def extractOrderBy(json_file, client):
    json_file = parse_query(json_file, client)
    groupBy = []
    groupByList = list(iterate(json_file, 'orderby'))
    for s in groupByList:
        value = []
        value.append(s['value'])
        try:
            value.append(s['sort'])
        except Exception as e:
            value.append('asc')
        groupBy.append(value)
    if len(groupBy) == 0:
        groupBy = "Unknown"
    return groupBy


def extractGroupBy(json_file, client):
    json_file = parse_query(json_file, client)
    groupBy = []
    groupByList = list(iterate(json_file, 'groupby'))
    for s in groupByList:
        groupBy.append(s['value'])
    if len(groupBy) == 0:
        groupBy = "Unknown"
    return groupBy


def extractHaving(json_file, client):
    json_file = parse_query(json_file, client)
    allHavings = []
    having = []
    havingList = list(iterate(json_file, 'having'))
    print("havingList")
    print(havingList) #'having': {'gt': [{'count': 'Orders.OrderID'}, 5]}



    attOpAndCompare = [] # attOperator and attOpCompare

    att = []  # customerId
    attOperator = []  # count
    attOpCompare = []  # gt...
    valCompare = []  # value example 5

    havingOrder = [] # end result



    for s in havingList: # take one having from [this having, , ,]

        #print("s")
        #print(s)

        parseOneCond(s, having, att, attOperator, attOpCompare, valCompare)

    #print("att end")
    #print(att)
    #print("valCompare end")
    #print(valCompare)

    i = 0
    for s in having:
        listWithCond = []

        if s == 'count': # with gt equals
            listWithCond.append(s)
        else:
            havingOrder.append(s)

        if s == 'count':
            listWithCond.append(att[i])
            listWithCond.append(valCompare[i])
            i = i + 1
            havingOrder.append(listWithCond)


    allHavings.append(havingOrder)

    print("havingOrder")
    print(havingOrder)

    print("allHavings")
    print(allHavings)

    if len(allHavings) == 0:
        allHavings = "Unknown"
    return allHavings

def iterate(data, param):
    if isinstance(data, list):
        for item in data:
            yield from iterate(item, param)
    elif isinstance(data, dict):
        for key, item in data.items():
            if key == param:
                yield item
            else:
                yield from iterate(item, param)


def parseOneCond(s, having, att, attOperator, attOpCompare, valCompare):
        #print("in parseOneCond funktion")

        for i in s:
                #print("i in first condition")
                #print(i)

                # if (i == "gt" or i == "le" or i == "eq" or i == "ne"):  # 1 dim
                #    attOpCompare = i
                value = i
                having.append(value)

                for t in s[i]: # took first {'and': [{'gt': [{'count': 'CustomerID'}, 1]}, {'gt': [{'count': 'CustomerID'}, 2]}]}

                    if type(t) is not str:
                        #print("type")
                        #print(type(t))

                        if type(t) is int:
                            #print("value t ")
                            #print(t)
                            valCompare.append(t)
                            #print("valCompare got")
                            #print(valCompare)

                        if type(t) is dict:
                            #print("s[i]")
                            #print(s[i])

                            #print("t / rest of logical op")
                            #print(t)  # {'and': [{'gt': [{'count': 'CustomerID'}, 1]}, {'gt': [{'count': 'CustomerID'}, 2]}]} first

                            #print("got count")
                            #print(t.get('count'))


                            if t.get('count') != None:
                                att.append( t.get('count') )
                                #print("att got")
                                #print(att)

                            parseOneCond(t, having, att, attOperator, attOpCompare, valCompare)

        return having



"""
Having:

id:
operator: OR
array:
    att
    attopr
operator: AND
array:
    att
    attopr
"""