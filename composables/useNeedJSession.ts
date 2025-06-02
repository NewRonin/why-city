export const useNeedJSession = () => {
  const returnObject = {
    sessionCookieAuth: useCookie("auth-cookie"),
    sessionCookie: useCookie("JSESSIONID"),
    jSessionId: "",
  };
  const jSessionId = returnObject.sessionCookieAuth.value
    ? `JSESSIONID=${returnObject.sessionCookieAuth.value}`
    : returnObject.sessionCookie.value
    ? `JSESSIONID=${returnObject.sessionCookie.value}`
    : "";
  returnObject.jSessionId = jSessionId;
  return returnObject;
};
