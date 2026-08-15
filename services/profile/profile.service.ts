export async function getLineProfile(userId: string) {
  try {
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    );

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect,
    };

    const response = await fetch(
      `https://api.line.me/v2/bot/profile/${userId}`,
      requestOptions,
    );
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}
