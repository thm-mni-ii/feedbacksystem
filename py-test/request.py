import requests, json
from pprint import pprint
import unittest
import datetime
import random
from requests_toolbelt.multipart.encoder import MultipartEncoder
import os
dirname = os.path.dirname(os.path.abspath(__file__))+"/"
print(dirname)

class TestRESTStudent(unittest.TestCase):
    def setUp(self):
        # How many digits to match in case of floating point answers
        self.URL = "http://localhost:8080/api/v1/"

        # print(r.headers)
        # self.auth_token = r.headers["Authorization"].replace("Bearer ","")

        r = requests.post(url=self.URL + "login/token", data=json.dumps({"name": "admin"}), verify=False,
                          headers={'content-type': 'application/json'})
        self.admin_auth_header = r.headers["Authorization"]

        r = requests.post(url=self.URL + "login/token", data=json.dumps({"name": "bmnn57"}), verify=False,
                          headers={'content-type': 'application/json'})
        self.student_auth_header = r.headers["Authorization"]

        r = requests.post(url=self.URL + "login/token", data=json.dumps({"name": "prof"}), verify=False,
                          headers={'content-type': 'application/json'})
        self.docent_auth_header = r.headers["Authorization"]

        r = requests.post(url=self.URL + "login/token", data=json.dumps({"name": "moderator"}), verify=False,
                          headers={'content-type': 'application/json'})
        self.moderator_auth_header = r.headers["Authorization"]

        self.stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S") + "_UNITTEST"

    def test_getAllcourses_route(self):
        r = requests.get(url=self.URL + "courses/all", data=json.dumps({}), verify=False,
                         headers={'content-type': 'application/json', 'Authorization': self.student_auth_header})

        self.assertEqual(type(r.json()), type([]))
        self.assertGreaterEqual(len(r.json()), 1)

    def test_AllSubmissions(self):
        """
        GET /api/v1/courses/submissions
        :return:
        """
        r = requests.get(url=self.URL + "courses/submissions", data=json.dumps({}), verify=False,
                         headers={'content-type': 'application/json', 'Authorization': self.student_auth_header})
        pprint(r.json())
        self.assertEqual(type(r.json()), type([]))
        self.assertGreaterEqual(len(r.json()), 1)


    def test_getCourses(self):
        """
        GET /api/v1/courses
        :return:
        """
        r = requests.get(url=self.URL + "courses/", data=json.dumps({}), verify=False,
                         headers={'content-type': 'application/json', 'Authorization': self.student_auth_header})
        pprint(r.json())
        self.assertEqual(type(r.json()), type([]))
        self.assertGreaterEqual(len(r.json()), 1)

    def test_post_put_delete_course(self):
        """
        PUT, POST, DELETE GET /api/v1/courses/:id
        :return:
        """
        course_name = "Kurse " + self.stamp
        r = requests.post(url=self.URL + "courses/", data=json.dumps(
            {"name": course_name, "description": "Created by Python with pleasure", "standard_task_typ": "FILE","course_semester":"SS19","course_modul_id":"CS1234",
             "course_end_date":datetime.datetime.today().strftime('%Y-%m-%d'), "personalised_submission":True}),
                          verify=False,
                          headers={'content-type': 'application/json', 'Authorization': self.admin_auth_header})
        
        self.assertEqual(type(r.json()), type({}))
        self.assertEqual(1, len(r.json()))
        v = r.json()
        self.assertTrue("course_id" in v)
        cid = v["course_id"]

        course_req_get = requests.get(url=self.URL + "courses/" + str(cid), data=json.dumps({}), verify=False,
                                      headers={'content-type': 'application/json',
                                               'Authorization': self.admin_auth_header})

        pprint(course_req_get.json())

        v = course_req_get.json()
        self.assertEqual(course_name, v["course_name"])

        course_name_new = str(random.random()) + course_name
        course_desc_new = str(random.random())

        course_req_put = requests.put(url=self.URL + "courses/" + str(cid), data=json.dumps(
            {"name": course_name_new, "description": course_desc_new, "standard_task_typ": "TEXT","course_semester":"SS19","course_modul_id":"CS1234",
             "course_end_date":datetime.datetime.today().strftime('%Y-%m-%d'),"personalised_submission":True}), verify=False,
                                      headers={'content-type': 'application/json',
                                               'Authorization': self.admin_auth_header})
        
        course_req_get = requests.get(url=self.URL + "courses/" + str(cid), data=json.dumps({}), verify=False,
                                      headers={'content-type': 'application/json',
                                               'Authorization': self.admin_auth_header})

        vv = course_req_get.json()
        self.assertEqual(course_name_new, vv["course_name"])
        self.assertEqual(course_desc_new, vv["course_description"])

        delete_req = requests.delete(url=self.URL + "courses/" + str(cid), data=json.dumps({}), verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.admin_auth_header})

        pprint(delete_req.json())
        course_req_get = requests.get(url=self.URL + "courses/" + str(cid), data=json.dumps({}), verify=False,
                                      headers={'content-type': 'application/json',
                                               'Authorization': self.admin_auth_header})
        self.assertEqual(len(course_req_get.json()), 0)

    def test_courses_all(self):
        course_req_get = requests.get(url=self.URL + "courses/all", data=json.dumps({}), verify=False,
                                      headers={'content-type': 'application/json',
                                               'Authorization': self.student_auth_header})
        pprint(course_req_get.json())

        self.assertEqual(type(course_req_get.json()), type([]))
        self.assertTrue(1 < len(course_req_get.json()))

    def test_aaaa_subscribe_unsubscribe(self):
        r_get_before = requests.get(url=self.URL + "courses", data=json.dumps({}), verify=False,
                                    headers={'content-type': 'application/json',
                                             'Authorization': self.student_auth_header})

        len_bf = len(r_get_before.json())

        requests.post(url=self.URL + "courses/11/subscribe", data=json.dumps({}), verify=False,
                      headers={'content-type': 'application/json',
                               'Authorization': self.student_auth_header})

        r_get_after = requests.get(url=self.URL + "courses", data=json.dumps({}), verify=False,
                                   headers={'content-type': 'application/json',
                                            'Authorization': self.student_auth_header})

        len_af = len(r_get_after.json())
        pprint(len(r_get_before.json()))
        pprint(len(r_get_after.json()))

        self.assertEqual(len_af, len_bf + 1)



        detailed_info = requests.get(url=self.URL + "courses/11", data=json.dumps({}), verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.student_auth_header})

        pprint(detailed_info.json())
        self.assertEqual(type(detailed_info.json()["tasks"]), type([]))

        self.assertTrue(len(detailed_info.json()["tasks"]) > 1)

        unsubscribe = requests.post(url=self.URL + "courses/11/unsubscribe", data=json.dumps({}), verify=False,
                      headers={'content-type': 'application/json', 'Authorization': self.student_auth_header})

        pprint(unsubscribe)


        r_get_thereafter = requests.get(url=self.URL + "courses", data=json.dumps({}), verify=False,
                                        headers={'content-type': 'application/json',
                                                 'Authorization': self.student_auth_header})

        self.assertEqual(len(r_get_thereafter.json()), len_af - 1)

        no_detailed_info = requests.get(url=self.URL + "courses/11", data=json.dumps({}), verify=False,
                                        headers={'content-type': 'application/json',
                                                 'Authorization': self.student_auth_header})

        self.assertEqual(type(no_detailed_info.json()["tasks"]), type([]))
        self.assertEqual(len(no_detailed_info.json()["tasks"]), 0)

    def test_grant_deny_revoke(self):
        """
        Grant Docent, grant tutor, revoke tutor, revoke docent

        Text by Task creation
        :return:
        """
        task_creation_1 = requests.post(url=self.URL + "courses/11/tasks",
                                        data=json.dumps({"name": "Task No " + self.stamp,
                                                         "description": "Task by Python. Yay it works",
                                                          "test_type": "BASH"}),
                                        verify=False,
                                        headers={'content-type': 'application/json',
                                                 'Authorization': self.docent_auth_header})

        self.assertEqual(task_creation_1.status_code, 400)

        requests.post(url=self.URL + "courses/11/grant/docent", data=json.dumps({"username": "prof"}),
                      verify=False,
                      headers={'content-type': 'application/json',
                               'Authorization': self.moderator_auth_header})

        # TODO check and test the error cases

        task_creation_2 = requests.post(url=self.URL + "courses/11/tasks",
                                        data=json.dumps({"name": "Task No " + self.stamp,
                                                         "description": "Task by Python. Yay it works",
                                                         "test_type": "FILE"}),
                                        verify=False,
                                        headers={'content-type': 'application/json',
                                                 'Authorization': self.docent_auth_header})

        pprint(self.docent_auth_header)

        pprint(task_creation_2.json())

        task_file_upload_url = task_creation_2.json()["upload_url"]

        multipart_data = MultipartEncoder(
            fields={
                # a file upload field
                'file': ('sample.sql', open(dirname+"sample.sql", 'rb'), 'application/file'),
            }
        )

        file_upload_response = requests.post(task_file_upload_url, data=multipart_data, verify=False,
                                 headers={'Content-Type': multipart_data.content_type, 'Authorization': self.docent_auth_header})
        print(file_upload_response.json())

        self.assertEqual(file_upload_response.json(),{'upload_success': True, 'filename': 'sample.sql'})

        self.assertEqual(len(task_creation_2.json()), 3)
        self.assertTrue("success" in task_creation_2.json())
        self.assertTrue("taskid" in task_creation_2.json())
        taskid = task_creation_2.json()["taskid"]

        task_get1 = requests.get(url=self.URL + "tasks/" + str(taskid),
                                 verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.docent_auth_header})

        task_put1 = requests.put(url=self.URL + "tasks/" + str(taskid),
                                 data=json.dumps({"name":"Task Name Update PY", "description": "Task by Python. Yay it works",
                                                  "test_type": "FILE"}),
                                 verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.student_auth_header})

        print(task_put1.json())
        self.assertEqual(401, task_put1.status_code)

        # TODO check that tutor can not give access and so on

        requests.post(url=self.URL + "courses/11/grant/tutor", data=json.dumps({"username": "bmnn57"}),
                      verify=False,
                      headers={'content-type': 'application/json',
                               'Authorization': self.docent_auth_header})

        task_put2 = requests.put(url=self.URL + "tasks/" + str(taskid),
                                 data=json.dumps({"name": "Task No " + self.stamp,
                                                  "description": "Task by Python. Yay it works",
                                                  "test_type": "STRING"}),
                                 verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.student_auth_header})

        # TODO upload a new test file


        self.assertTrue("success" in task_put2.json())
        self.assertTrue("upload_url" in task_put2.json())

        deny1 = requests.post(url=self.URL + "courses/11/deny/tutor", data=json.dumps({"username": "bmnn57"}),
                              verify=False,
                              headers={'content-type': 'application/json',
                                       'Authorization': self.docent_auth_header})

        pprint(deny1.json())
        task_del1 = requests.delete(url=self.URL + "tasks/" + str(taskid),
                                    verify=False,
                                    headers={'content-type': 'application/json',
                                             'Authorization': self.student_auth_header})

        pprint(task_del1.json())
        self.assertEqual(401, task_del1.status_code)
        task_del2 = requests.delete(url=self.URL + "tasks/" + str(taskid),
                                    data=json.dumps({}),
                                    verify=False,
                                    headers={'content-type': 'application/json',
                                             'Authorization': self.docent_auth_header})

        task_get2 = requests.get(url=self.URL + "tasks/" + str(taskid),
                                 data=json.dumps({}),
                                 verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.docent_auth_header})

        pprint(task_get1.json())
        pprint(task_get2.json())
        self.assertEqual(401, task_get2.status_code)

        deny_docent = requests.post(url=self.URL + "courses/11/deny/docent", data=json.dumps({"username": "prof"}),
                                    verify=False,
                                    headers={'content-type': 'application/json',
                                             'Authorization': self.moderator_auth_header})

        pprint(deny_docent.json())


    def test_submissions(self):
        get_submissions = requests.get(url=self.URL + "courses/2/submissions", data=json.dumps({}),
                                       verify=False,
                                       headers={'content-type': 'application/json',
                                                'Authorization': self.docent_auth_header})

        pprint(get_submissions.json())
        self.assertTrue(1 <= len(get_submissions.json()))

    def test_big_user_submission_list(self):
        get_submissions = requests.get(url=self.URL + "courses/submissions", data=json.dumps({}),
                                       verify=False,
                                       headers={'content-type': 'application/json',
                                                'Authorization': self.student_auth_header})

        pprint(get_submissions.json())
        pprint(len(get_submissions.json()))
        self.assertTrue(1 <= len(get_submissions.json()))

    def test_getTaskByTaskID_route(self):
        res = requests.get(url=self.URL + "tasks/10/submissions", data=json.dumps({}),
                                     verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.docent_auth_header})

        self.assertEqual(type(res.json()), type([]))
        self.assertGreaterEqual(len(res.json()), 1)

    def test_student_submit_result_task(self):
        result_req_bf = requests.get(url=self.URL + "tasks/10/result", data=json.dumps({}),
                                     verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.student_auth_header})

        data = {"data": "2f2d45032dbe9c1b5e9cab6f6059df1d"}



        submit_req = requests.post(url=self.URL + "tasks/10/submit", data=json.dumps(data),
                                   verify=False,
                                   headers={'content-type': 'application/json',
                                            'Authorization': self.student_auth_header})
        pprint(submit_req.json())

        submit_req_file = requests.post(url=self.URL + "tasks/12/submit", data=json.dumps({}),
                                   verify=False,
                                   headers={'content-type': 'application/json',
                                            'Authorization': self.student_auth_header})

        pprint(submit_req_file.json())
        file_upload_url = submit_req_file.json()["upload_url"]

        multipart_data = MultipartEncoder(
            fields={
                # a file upload field
                'file': ('sample.sql', open(dirname+"sample.sql", 'rb'), 'application/file'),
            }
        )

        file_upload_response = requests.post(file_upload_url, data=multipart_data, verify=False,
                                             headers={'Content-Type': multipart_data.content_type,
                                                      'Authorization': self.student_auth_header})

        self.assertEqual({'submission_upload_success': True, 'filename': 'sample.sql'}, file_upload_response.json())

        result_req_af = requests.get(url=self.URL + "tasks/10/result", data=json.dumps({}),
                                     verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.student_auth_header})
        self.assertEqual(submit_req.status_code, 202)
        self.assertTrue(len(result_req_bf.json()) + 1 == len(result_req_af.json()))

        all_subs = requests.get(url=self.URL + "tasks/10/submissions", data=json.dumps({}),
                                verify=False,
                                headers={'content-type': 'application/json',
                                         'Authorization': self.docent_auth_header})



        pprint(all_subs.json())
        self.assertTrue(5 < len(all_subs.json()))
        requests.post(url=self.URL + "courses/11/unsubscribe", data=json.dumps({}),
                      verify=False,
                      headers={'content-type': 'application/json',
                               'Authorization': self.student_auth_header})

    def test_testsystems_admin_interactions(self):
        result_all_systems = requests.get(url=self.URL + "testsystems", data=json.dumps({}),
                                          verify=False,
                                          headers={'content-type': 'application/json',
                                                   'Authorization': self.admin_auth_header})

        pprint(result_all_systems.json())
        self.assertTrue(3 <= len(result_all_systems.json()))
        sysm_post = requests.post(url=self.URL + "testsystems", data=json.dumps({
            "id": "sqlchecker_" + self.stamp[9:20],
            "name": "SQL Checker",
            "description": "Provide Test system for ...",
            "supported_formats": "SQL"
        }),
                                  verify=False,
                                  headers={'content-type': 'application/json',
                                           'Authorization': self.admin_auth_header})
        pprint(sysm_post.json())

        id = sysm_post.json()["testsystem_id"]

        new_name = str(random.random()) + str(random.random())

        sysm_put = requests.put(url=self.URL + "testsystems/" + str(id), data=json.dumps({
            "name": new_name,
            "description": new_name,
            "supported_formats": "PYTHON"
        }), verify=False,
                                headers={'content-type': 'application/json',
                                         'Authorization': self.admin_auth_header})

        sysm_get = requests.get(url=self.URL + "testsystems/" + str(id), data=json.dumps({}), verify=False,
                                headers={'content-type': 'application/json',
                                         'Authorization': self.admin_auth_header})

        v = sysm_get.json()
        pprint(v)
        self.assertEqual(v["description"], new_name)
        self.assertEqual(v["name"], new_name)
        self.assertEqual(v["supported_formats"], 'PYTHON')

        sys_del = requests.delete(url=self.URL + "testsystems/" + str(id), data=json.dumps({}), verify=False,
                                  headers={'content-type': 'application/json',
                                           'Authorization': self.admin_auth_header})

        self.assertEqual({'success': True}, sys_del.json())

    def test_admin_delete_users_batch(self):
        name_list = ['sam','ben','jenny','dave','caleb','jane','luke']
        for person in name_list:
            res = requests.post(url=self.URL + "login/token", data=json.dumps({"name": person}), verify=False,
                              headers={'content-type': 'application/json'})
            if res.status_code != 200:
                self.fail("Creating " + person + " failed")



        all_users = requests.get(url=self.URL + "users", verify=False, headers={'content-type': 'application/json', 'Authorization': self.admin_auth_header})
        id_list = []
        for entry in all_users.json():
            if entry['username'] in name_list:
                id_list.append(entry['user_id'])
        pprint(id_list)

        ## Delete using batch list

        del_users = requests.delete(url=self.URL + "users", verify=False, data=json.dumps({"user_id_list": id_list}), headers={'content-type': 'application/json', 'Authorization': self.admin_auth_header})
        pprint(del_users.json())

    def test_admin_user_management(self):
        all_users = requests.get(url=self.URL + "users", data=json.dumps({}), verify=False,
                                  headers={'content-type': 'application/json',
                                           'Authorization': self.admin_auth_header})


        self.assertEqual(type([]), type(all_users.json()))
        self.assertTrue(4 <= len(all_users.json()))

        gr_moderator = requests.post(url=self.URL + "users/grant/moderator", data=json.dumps({"username":"hiwi"}), verify=False,
                     headers={'content-type': 'application/json',
                              'Authorization': self.admin_auth_header})

        gr_admin = requests.post(url=self.URL + "users/grant/admin", data=json.dumps({"username": "bmnn57"}),
                                     verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.admin_auth_header})

        all_users = requests.get(url=self.URL + "users", data=json.dumps({}), verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.admin_auth_header})

        #pprint(all_users.json())
        #pprint(gr_moderator.json())
        #pprint(gr_admin.json())

        for u in all_users.json():
            if u["username"] == "bmnn57":
                print(u)
                print(u["role_id"],"bmnn57")
                if u["role_id"] != 1:
                    self.fail("Role was not correctly changed")
            if u["username"] == "hiwi":
                print(u)
                if u["role_id"] != 2:
                    self.fail("Role was not correctly changed")

        gr_moderator = requests.post(url=self.URL + "users/revoke", data=json.dumps({"username": "hiwi"}),
                                     verify=False,
                                     headers={'content-type': 'application/json',
                                              'Authorization': self.admin_auth_header})

        gr_admin = requests.post(url=self.URL + "users/revoke", data=json.dumps({"username": "bmnn57"}),
                                 verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.admin_auth_header})
        pprint(gr_moderator.json())
        pprint(gr_admin.json())
        all_users = requests.get(url=self.URL + "users", data=json.dumps({}), verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.admin_auth_header})

        for u in all_users.json():
            if u["username"] == "bmnn57":
                print(u)
                if u["role_id"] != 16:
                    self.fail("Role was not correctly changed")
            if u["username"] == "hiwi":
                print(u)
                if u["role_id"] != 16 :
                    self.fail("Role was not correctly changed")

        r = requests.post(url=self.URL + "login/token", data=json.dumps({"name": "python_student"}), verify=False,
                          headers={'content-type': 'application/json'})
        pprint(r.json())

        all_users2 = requests.get(url=self.URL + "users", data=json.dumps({}), verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.admin_auth_header})

        pythonUserID = -1
        for u in all_users2.json():
            if u["username"] == "python_student":
                print(u)
                pythonUserID = u["user_id"]
                break

        delete_users = requests.delete(url=self.URL + "users/"+str(pythonUserID), data=json.dumps({}), verify=False,
                                 headers={'content-type': 'application/json',
                                          'Authorization': self.admin_auth_header})
        pprint(delete_users.json())
        self.assertEqual(delete_users.json(),{'deletion': True})


    def test_user_admin_last_logins(self):
        users = requests.get(url=self.URL + "users", verify=False,
                                       headers={'content-type': 'application/json',
                                                'Authorization': self.admin_auth_header})
        pprint(users.json())

        self.assertEqual(type([]), type(users.json()))
        self.assertTrue(4 <= len(users.json()))

        users_filter_b = requests.get(url=self.URL + "users?before=2018-12-01", verify=False, headers={'content-type': 'application/json', 'Authorization': self.admin_auth_header})
        users_filter_a = requests.get(url=self.URL + "users?after=2018-12-12", verify=False, headers={'content-type': 'application/json', 'Authorization': self.admin_auth_header})
        users_filter_ab = requests.get(url=self.URL + "users?before=2018-12-01&after=2018-12-02", verify=False, headers={'content-type': 'application/json', 'Authorization': self.admin_auth_header})

        # TODO: more testing, but if it work, just enough
        pprint(len(users_filter_b.json()))
        pprint(len(users_filter_a.json()))
        pprint(len(users_filter_ab.json()))


unittest.main()
