const express = require("express");
//express 프로그램을 express 변수에 담다.
const app = express();
//express 프로그램을 실행해서 app 변수에 담다.
const { getConnection, oracladb } = require("./db");
//db.js 파일에서 연결 설정 및 오라클 라이브러리 가져오기
const cors = require("cors");
const {
  NUMBER,
  AQ_DEQ_WAAQ_MSG_DELIV_MODE_PERSISTENTIT_FOREVER,
} = require("oracledb");
//cors : 다른 서버에서 온 요청이나 내가 다른 서버에 요청할 때 허용한다. (보안완화)

app.use(cors());
//app.use : 다른 코드들 중에서 현재 코드를 가장 먼저 처리하라는 의미
app.use(express.json());
//client → 데이터를 json 형식으로 전송, 서버에 도착하면 그냥 긴 문자열로 바뀜
//위 함수를 사용하면 중간에서 문자열 분석 후 JS 객체로 변환해서 req.body에 넣어줌

app.get("/", (req, res) => {
  res.send("OK"); //브라우저 접속시 "OK" 메시지 출력
});

//페이징
app.get("/S_PRODUCT/:page", async (req, res) => {
  //주소창에서 사용자가 page를 입력하면 req, res를 통해 보낸다.
  const page = Number(req.params.page); //req로 데이터를 가져오면 문자열로 가져오기 때문에 숫자로 변경
  //params : 어떤 페이지를 원하는지 url에 명시하는 방식
  const conn = await getConnection(); //DB 연결 객체 획득
  const { metaData, row } = await conn.execute(
    `SELECT * From S_PRODUCT order by PRODUCT_NO
    offset (page - 1) * 10 rows fetch next 10 rows only`, //페이지 번호에 맞춰 10개씩 가져오는 쿼리, no순대로 정렬
    //offset : 시작위치
    { page },
  );
  const json = JSON.stringify(rows); //변환된 JSON 문자열을 클라이언트(브라우저)에게 응답으로 보내기
  res.send(json);
});

//행 삭제
app.get("/S_PRODUCT_delete/:PRODUCT_NO", async (req, res) => {
  const conn = await getConnection(); //함수가 db 연결을 마칠 때까지 기다림.
  const result = await conn.execute(
    //result : 쿼리 실행 결과를 받음 (몇개의 행이 삭제됐는지 정보가 들어있음)
    //(conn : db 연결 객체 / execute : 실행하다)를 통해 쿼리를 실행
    `DELETE FROM S_PRODUCT WHERE PRODUCT_NO = :PRODUCT_NO`,
    { PRODUCT_NO: req.params.PRODUCT_NO },
    { autoCommit: true }, //자동커밋
  );
  if (result.rowsAffected) {
    res.json({ retCode: "OK" }); //삭제된 행의 수를 숫자로 알려줌
    //삭제 성공 시 client에게 문자열 데이터를 보냄 "OK" 이 문자를 보내면 화면에서 그 행을 삭제
  } else {
    res.json({ retCode: "NG" });
  }
  res.send(result); //실패시 client에게 "NG"를 보내 성공 못했다고 알림.
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});

app.get("/S_PRODUCT_insert", async (req, res) => {
  const { SNACK, CHOCOLATE, JELLY } = req.body;
  const conn = await getConnection();
  const result = await conn.execute(
    `insert into S_PRODUCT(PRODUCT_NO, SNACK, CHOCOLATE, JELLO)
    values(SELECT nvl(max(S0001),0)+1 from S_PRODUCT, :SNACK, :CHOCOLATE, :JELLY)
    returning PRODUCT_NO into :PRODUCT_NO`,
    {
      PRODUCT_NO: { dir: oracladb.BIND_OUT, type: oracladb.NUMBER },
      SNACK,
      CHOCOLATE,
      JELLY,
    },
    { autoCommit: true },
  );
  if (result.rowsAffected) {
    res.json({
      retCode: "OK",
      PRODUCT_NO: result.outBinds.PRODUCT_NO[0],
      SNACK: snack,
      CHOCOLATE: chocolate,
      JELLY: jelly,
    });
  } else {
    res.json({ retCode: "NG" });
  }
  res.send(result);
});

//등록
app.post("/S_PRODUCT_insert", async (req, res) => {
  console.log(req.body); //req.params 속성
  const { SNACK, CHOCOLATE, JELLY } = req.body;
  const conn = await getConnection();
  const result = await conn.execute(
    `insert into S_PRODUCT(PRODUCT_NO, SNACK, CHOCOLATE, JELLO)
      values((SELECT nvl(max(PRODUCT_NO),0)+1 from S_PRODUCT), :SNACK, :CHOCOLATE, :JELLY)
    returning PRODUCT_NO into :PRODUCT_NO`,
    {
      PRODUCT_NO: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      SNACK,
      CHOCOLATE,
      JELLY,
    },
    { autoCommit: true },
  );
  console.log(result.outBinds.bno[0]);

  // //정상삭제되면 ok , 삭제못하면 NG
  if (result.rowsAffected) {
    res.json({
      retCode: "OK",
      PRODUCT_NO: result.outBinds.PRODUCT_NO[0],
      SNACK: snack,
      CHOCOLATE: chocolate,
      JELLY: jelly,
    }); // {"retCode":"OK"}
  } else {
    res.json({ retCode: "NG" });
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
