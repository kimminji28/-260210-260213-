create table S_USERS (
             USER_NO varchar2(100) primary key --사용자넘버
            ,USER_ID varchar2(100) not null --사용자아이디
            ,USER_PW varchar2(100) not null --사용자비밀번호
            ,USER_NAME varchar2(20) not null --사용자이름
            ,TEL number(30) not null --폰번호
            ,EMAIL varchar2(100) --이메일
            ,ADDRESS varchar2(300) not null --주소
);

create table S_LOGIN (
             LOGIN_NO varchar2(100) primary key --로그인넘버
            ,LOGIN_ID varchar2(100) not null --아이디
            ,LOGIN_PW varchar2(100) not null --비밀번호
);

create table S_PRODUCT (
             PRODUCT_NO varchar2(100) primary key --상품넘버
            ,SNACK varchar2(100) --과자
            ,CHOCOLATE varchar2(100) not null --초콜릿
            ,JELLY varchar2(100) not null --젤리
);

SELECT * from S_USERS;
SELECT * from S_LOGIN;
SELECT * from S_PRODUCT;