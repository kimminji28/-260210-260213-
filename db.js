const oracledb = require("oracledb"); //node.js 공식 프로그램 oracledb 모듈 불러오기
//DB에 연결하고, SQL 쿼리를 전송하고, 결과를 받아오는 로우 레벨(Low-level) 작업을 수행

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; //쿼리의 형식을 객체로 전환

async function getConnection() {
  return await oracledb.getConnection({
    user: "scott",
    password: "tiger",
    connectString: "192.168.0.41:1521/xe",
  });
}

module.exports = { getConnection, oracledb };
