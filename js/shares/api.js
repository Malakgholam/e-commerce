const base_url = "https://dummyjson.com/";

/* 
endpoint: name of endpoint

success: callbackk
*/
//logic of handelRemoteRequest
export default async function handelRemoteRequest(
  endpoint,
  success,
  error,
  startLoading,
  stopLoading
) {
  startLoading(); //4th param
  try {
    const res = await fetch(`${base_url}${endpoint}`);//first param
    if (res.ok) {
      const data = await res.json();
      success(data); //second parameter
    } else {
      throw new Error("something went wrong");
    }
  } catch (e) {
    console.log(e);
    error(e); // third parameter
  } finally {
    stopLoading(); // 5th parameter
  }
}