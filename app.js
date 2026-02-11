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
app.get("/S_PRODUCT/:category/:page", async (req, res) => {
  //주소창에서 사용자가 page를 입력하면 req, res를 통해 보낸다.
  const page = Number(req.params.page) || 1; //req로 데이터를 가져오면 문자열로 가져오기 때문에 숫자로 변경
  const category = req.params.category;
  //params : 어떤 페이지를 원하는지 url에 명시하는 방식
  //NaN 방지용 || 1; (page라는 문자를 넣어도 페이지 연결되게)
  console.log(page);
  const offsetValue = (page - 1) * 10;

  const conn = await getConnection(); //DB 연결 객체 획득

  const { rows } = await conn.execute(
    `SELECT * FROM S_PRODUCT 
     WHERE kind = decode(:category, 'ALL', kind, :category)
     ORDER BY SPRODUCT_NO
    OFFSET :offsetValue ROWS FETCH NEXT 10 ROWS ONLY`,
    { offsetValue, category },
  );
  //페이지 번호에 맞춰 10개씩 가져오는 쿼리, no순대로 정렬
  //offset : 시작위치
  console.log(rows);

  const json = JSON.stringify(rows); //변환된 JSON 문자열을 클라이언트(브라우저)에게 응답으로 보내기
  res.send(json);
});
//NJS-098 에러 해결: 오라클은 :page - 1 처럼 바인딩 변수에 연산 기호가 섞이는 것을 좋아하지 않습니다. 그래서 offsetValue라는 변수에 미리 계산 결과(0, 10, 20...)를 담아서 통째로 넘겨준 것입니다.
//변수명 일치: const { metaData, row }라고 받으면 row라는 변수 하나만 생깁니다. 하지만 실제 결과 데이터는 여러 줄(rows)이므로 이름을 rows로 맞췄습니다.
//바인딩 변수 이름: 쿼리 안의 :offsetValue와 아래 { offsetValue }의 이름이 같아야 데이터가 정확히 그 자리로 들어갑니다.

//행 삭제
app.get("/S_PRODUCT_delete/:SPRODUCT_NO", async (req, res) => {
  const conn = await getConnection(); //함수가 db 연결을 마칠 때까지 기다림.
  const result = await conn.execute(
    //result : 쿼리 실행 결과를 받음 (몇개의 행이 삭제됐는지 정보가 들어있음)
    //(conn : db 연결 객체 / execute : 실행하다)를 통해 쿼리를 실행
    `DELETE FROM S_PRODUCT WHERE SPRODUCT_NO = :SPRODUCT_NO`,
    { SPRODUCT_NO: req.params.SPRODUCT_NO },
    { autoCommit: true }, //자동커밋
  );
  if (result.rowsAffected) {
    res.json({ retCode: "OK" }); //삭제된 행의 수를 숫자로 알려줌
    //삭제 성공 시 client에게 문자열 데이터를 보냄 "OK" 이 문자를 보내면 화면에서 그 행을 삭제
  } else {
    res.json({ retCode: "NG" });
  }
});

// app.listen(3000, () => {
//   console.log("http://localhost:3000");
// });

//수정.
app.get(
  "/S_PRODUCT_update/:SPRODUCT_NO/:SPRODUCT_NAME/:SPRODUCT_PRICE/:KCAL/:EDATE/:REVIEW",
  async (req, res) => {
    console.log(req.params);
    const conn = await getConnection();
    const result = await conn.execute(
      `update S_PRODUCT
        set SPRODUCT_NAME = :SPRODUCT_NAME
            ,SPRODUCT_PRICE = :SPRODUCT_PRICE
            ,KCAL = :KCAL
            ,EDATE = :EDATE
            ,REVIEW = :REVIEW
     where SPRODUCT_NO = :SPRODUCT_NO`,
      {
        //bno : {dir:oracledb.BINDd+OUT, typr: oracle.NUMBER}
        SPRODUCT_NO: Number(req.params.SPRODUCT_NO),
        SPRODUCT_NAME: req.params.SPRODUCT_NAME,
        SPRODUCT_PRICE: Number(req.params.SPRODUCT_PRICE),
        KCAL: Number(req.params.KCAL),
        EDATE: req.params.EDATE,
        REVIEW: req.params.REVIEW,
      },
      { autoCommit: true },
    );
    // //정상삭제되면 ok , 삭제못하면 NG
    if (result.rowsAffected) {
      res.json({ retCode: "OK" });
    } else {
      res.json({ retCode: "NG" });
    }
    // res.send(result); // 응답처리
  },
);

//로그인
app.post("/S_LOGIN", async (req, res) => {
  const { LOGIN_ID, LOGIN_PW } = req.body;
  console.log(LOGIN_ID, LOGIN_PW);

  const conn = await getConnection();
  const result = await conn.execute(
    `SELECT * FROM S_LOGIN WHERE LOGIN_ID = :LOGIN_ID AND LOGIN_PW = :LOGIN_PW`,
    { LOGIN_ID: LOGIN_ID, LOGIN_PW: LOGIN_PW },
  );

  // //정상등록되면 ok , 등록못하면 NG
  if (result.rows.length > 0) {
    res.json({ retCode: "OK" }); // {"retCode":"OK"}
    console.log("로그인 성공");
  } else {
    res.json({ retCode: "NG" });
    console.log("로그인 실패");
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
