import app from "../server/index.mjs";

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`PM Cosmetics Hub API listening on :${port} (Gate CLOSED)`);
});
