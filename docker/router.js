const express = require("express");
const db = require("./database");

const router = express.Router();

const createRawSQLQueryFromSearch = (q) => {
  let whereClause = "";

  const addWhereCondition = (condition) =>
    !whereClause
      ? (whereClause += ` WHERE ${condition}`)
      : (whereClause += ` AND ${condition}`);

  q.split(" ").map((qFilter) => {
    const [key, value] = qFilter.split("==");

    switch (key) {
      case "ip.src":
        addWhereCondition("sourceIP='" + value + "'");
        break;
      case "ip.dst":
        addWhereCondition("destinationIP='" + value + "'");
        break;
      case "tcp.port":
        addWhereCondition("port='" + value + "'");
        break;
      default:
        break;
    }
  });

  return "SELECT * FROM TrafficLogs" + whereClause + ";";
};

router.get("/", (req, res) => {
  res.redirect("/search");
});

router.get("/search", (req, res) => {
  const { q = "" } = req.query;

  const rawSQLQuery = createRawSQLQueryFromSearch(q);

  db.all(rawSQLQuery, (err, rows) => {
    if (err) console.error(`[-] ${err.message}`);

    res.render("pages/search", {
      logs: rows || [],
      q,
    });
  });
});

module.exports = router;
