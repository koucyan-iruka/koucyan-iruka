function w2jconvert(){
    const year = parseInt(document.getElementById('yearInput').value);
            let era = "";
            let JY = 0;

            if (year >= 2019) {
                era = "令和";
                JY = year - 2018;
            } else if (year >= 1989) {
                era = "平成";
                JY = year - 1988;
            } else if (year >= 1926) {
                era = "昭和";
                JY = year - 1925;
            } else if (year >= 1912) {
                era = "大正";
                JY = year - 1911;
            } else if (year >= 1868) {
                era = "明治";
                JY = year - 1867;
            } else {
                document.getElementById('result').innerText = "1868年以降の西暦を\n入力してください";
                return;
            }

            const wareki = (JY === 1) ? `${era}元年` : `${era}${JY}年`;
            document.getElementById('result').innerText = `${wareki} `;
}

function j2wconvert(){
    const jpYearInput = document.getElementById('jpyearIn');
    const jpYearValue = jpYearInput.value;
    
    console.log(jpYearValue);
    
    const eraInput = document.getElementById('eraInput').value;
    let year;

    switch (eraInput) {
        case 'R':
            year = 2018 + parseInt(jpYearValue);
            break;
        case 'H':
            year = 1988 + parseInt(jpYearValue);
            break;
        case 'S':
            year = 1925 + parseInt(jpYearValue);
            break;
        case 'T':
            year = 1911 + parseInt(jpYearValue);
            break;
        case 'M':
            year = 1867 + parseInt(jpYearValue);
            break;

        default:
        return;
    }
    document.getElementById('wresult').innerText = `${year}年`;

    if (document.getElementById("jpyearIn").value == ""){
        document.getElementById("wresult").innerText = "有効な年数を\n入力してください";
    }
}