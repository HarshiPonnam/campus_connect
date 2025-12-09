const toggleBlockUser = async (authorId: string) => {
  try {
    const token = auth.user?.token;    
    const res = await fetch(`http://localhost:5050/api/users/${authorId}/block`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    if (json.ok) {
      console.log(json.data.blocked ? "User blocked" : "User unblocked");
    }
    if (json.ok && json.data.blocked) {
  auth.user!.user.blockedUsers.push(authorId);
}
  } catch (err) {
    console.error(err);
  }

};
