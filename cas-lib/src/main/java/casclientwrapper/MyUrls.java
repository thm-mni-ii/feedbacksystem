package casclientwrapper;

/**
 * Class which holds and creates all URLS being used by the application.
 * Change the base urls to your own server.
 */

public class MyUrls {
    public static final String MOODLE_BASE_URL = "https://fk-vv.mni.thm.de/moodle/";
    public static final String CAS_BASE_URL = "https://cas.thm.de:443/cas/";
    private static final String MOODLE_TOKEN_EXTENSION = "mod/tals/token.php";
    private static final String MOODLE_WEBSERVICE_EXTENSION = "webservice/rest/server.php";
    public static final String MOODLE_TOKEN_URL = MOODLE_BASE_URL + MOODLE_TOKEN_EXTENSION;
    public static final String MOODLE_WS_URL = MOODLE_BASE_URL + MOODLE_WEBSERVICE_EXTENSION;

    private static final String USERID_URL_PART = "&userid=";
    private static final String FUNCTION_URL_PART = "&wsfunction=";
    private static final String TOKEN_URL_PART =  "?wstoken=";
    private static final String APPOINTMENT_ID_URL_PART = "&appointmentid=";
    private static final String PIN_URL_PART = "&pinum=";
    private static final String MOODLE_WS_FORMAT_JSON = "&moodlewsrestformat=json";
    private static final String MOODLE_GET_TODAYS_APPOINTMENTS_FUNCTION = "mod_wstals_get_todays_appointments";
    private static final String MOODLE_GET_COURSE_LIST_FUNCTION = "mod_wstals_get_courses";
    private static final String MOODLE_SEND_PIN_FUNCTION = "mod_wstals_insert_attendance";
    private static final String MOODLE_FETCH_PIN_INFO_FUNCTION = "mod_wstals_check_for_enabled_pin";

    /**
     * Method to create a string for mod_wstals_get_todays_appointments webservice.
     * @param token moodle token is needed in the request
     * @param userid userid of the user whos appointments are to be requested
     * @return String of the URL
     */
    public static String getTodaysAppointmentRequestUrl(String token, String userid) {
        return MOODLE_WS_URL
                + TOKEN_URL_PART + token
                + FUNCTION_URL_PART + MOODLE_GET_TODAYS_APPOINTMENTS_FUNCTION
                + USERID_URL_PART + userid
                + MOODLE_WS_FORMAT_JSON;
    }

    /**
     * Method to create a string for mod_wstals_get_courses webservice.
     * @param token moodle token is needed in the request
     * @param userid userid of the user whos courses are to be requested
     * @return String of the URL
     */
    public static String getCourseListRequestUrl(String token, String userid) {
        return MOODLE_WS_URL
                + TOKEN_URL_PART + token
                + FUNCTION_URL_PART + MOODLE_GET_COURSE_LIST_FUNCTION
                + USERID_URL_PART + userid
                + MOODLE_WS_FORMAT_JSON;
    }

    /**
     * Method to create a string for mod_wstals_insert_attendance webservice.
     * @param token moodle token is needed in the request
     * @param userid userid of the user
     * @param appointmentid id of the appointment
     * @param pin pin that was entered
     * @return
     */
    public static String getSendPinRequestUrl(String token, String userid, int appointmentid, String pin) {
        return MOODLE_WS_URL
                + TOKEN_URL_PART + token
                + FUNCTION_URL_PART + MOODLE_SEND_PIN_FUNCTION
                + APPOINTMENT_ID_URL_PART + appointmentid
                + USERID_URL_PART + userid
                + PIN_URL_PART + pin
                + MOODLE_WS_FORMAT_JSON;
    }

    /**
     * Method to create a string for mod_wstals_check_for_enabled_pin webservice.
     * @param token moodle token is needed in the request
     * @param userid userid of the user whos appointments are to be requested
     * @param appointmentid id of the appointment for which we want to request the information
     * @return String of the URL
     */
    public static String getFetchPinInfoUrl(String token, String userid, int appointmentid) {
        return MOODLE_WS_URL
                + TOKEN_URL_PART + token
                + FUNCTION_URL_PART + MOODLE_FETCH_PIN_INFO_FUNCTION
                + APPOINTMENT_ID_URL_PART + appointmentid
                + USERID_URL_PART + userid
                + MOODLE_WS_FORMAT_JSON;
    }
}
