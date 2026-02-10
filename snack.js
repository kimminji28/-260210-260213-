//내일 수정할 것!!!

const removeS_PRODUCT = (e) => {
  const tr = e.target.parentElement.parentElement;
  const bno = tr.children[0].innerText;

  fetch("http://localhost:3000/S_PRODUCT_delete/" + bno)
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      if (data.retCode == "OK") {
        //화면 row 삭제
        const tr = e.target.parentElement.parentElement;
        tr.remove();
      } else {
        alert("처리중 예외 발생.");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

function makeRow(ele = {}) {
  const tr = document.createElement("tr");
  //보여줄 항목
  for (let prof of ["PRODUCT_NO", "TITLE", "WRITER"]) {
    const td = document.createElement("td");
    td.innerHTML = ele[prof];
    tr.appendChild(td);
  }
  //td , button
  const deltd = document.createElement("td");
  const btn = document.createElement("button");
  btn.innerHTML = `삭제`;
  deltd.appendChild(btn);
  tr.appendChild(deltd);

  //btn에 이벤트 등록
  btn.addEventListener("click", removeS_PRODUCT);

  return tr;
}

//페이징 a 클릭.
document.querySelectorAll(".pagination a").forEach((aTag) => {
  aTag.addEventListener("click", (e) => {
    const page = aTag.innerHTML;
    fetch("http://localhost:3000/S_PRODUCT/" + page)
      .then((resp) => resp.json())
      .then((data) => {
        data.forEach((ele) => {
          const tr = makeRow(ele);
        });
      });
  });
});
