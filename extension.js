(function () {
  //https://katanya.co.uk/labs/bookmarklet-generator

  var results = [];

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const headlines = [];

  [...document.querySelectorAll('main>c-wiz>div>div')].forEach(el => {
    var btn = document.createElement('div');
    btn.className = 'voting'
    btn.innerHTML = '<div class="vote positive">👍</div><div class="vote negative">👎</div>';

    var h3 = el.querySelector('h3');

    if (!h3) {
      return
    }
    var time = el.querySelector('time');

    var headline = h3.textContent;
    var dateTime = time.attributes.dateTime.value;
    var source = time.previousSibling.textContent;

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      var positive = e.target.classList.contains('positive');

      vote(headline, positive, dateTime, source);
      activate(positive)
    };

    function activate(positive) {
      var positiveBtn = btn.querySelector('.positive');
      var negativeBtn = btn.querySelector('.negative');

      if (positive) {
        positiveBtn.classList.add('active');
        negativeBtn.classList.remove('active');
      } else {
        negativeBtn.classList.add('active');
        positiveBtn.classList.remove('active');
      }
    }

    // if (h3) {
    el.appendChild(btn);
    headlines.push({ headline, dateTime, source });
    // h3.style.background = 'red'
    // }

  })

  const vote = (headline, positive, datetime, source) => {
    results = [...results.filter(r => r.headline !== headline), { headline, positive, datetime, source }]
    displayResults();
  }

  const displayResults = () => {
    var total = results.length;
    var pos = results.filter(r => r.positive).length;
    var neg = results.filter(r => !r.positive).length;

    document.querySelector('.results-button').textContent = `Get results (👍${pos} 👎${neg} Σ${total} )`;
  }

  const style = document.createElement('style');
  style.innerHTML = `
      .voting {
        display: flex;
      }
        .vote {
      height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 49px;
      position: relative;
      margin: 0 0 10px 10px;
      color: white;
      border: 1px solid #5f6368;
      text-align: center;
      font-size: 20px;
      bottom: 0;
      border-radius: 5px;
      z-index: 9999;
      }

      .vote.positive.active{
        background: #1b901b
      }

      .vote.negative.active{
        background: #ffa500
      }

      .vote:hover {
        cursor: pointer;
        background: #FFF;
      }

      .results-button{
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 9999;
        height: 40px;
        width: 200px;
      }
      .save-for-later{
        bottom: 40px;
      }
    `;
  document.head.appendChild(style);

  var btn = document.createElement('button')
  btn.className = 'results-button';
  btn.innerHTML = 'Get results';

  btn.onclick = () => {
    var resultArray = [['Date', 'Headline', 'Pos/Neg', 'Source'],
    ...results.map(r => [
      wrapWithQuotes(h.dateTime),
      wrapWithQuotes(h.headline),
      wrapWithQuotes(r.positive ? '+' : '-'),
      wrapWithQuotes(h.source)])]

    let csvContent = toCsv(resultArray)

    var currentDate = getCurrentDateString();
    var country = getCountry();

    var pos = results.filter(r => r.positive).length;
    var neg = results.filter(r => !r.positive).length;

    download(`${country}p${pos}n${neg}_${currentDate}.csv`, csvContent)
  }
  document.body.appendChild(btn);

  var saveForLater = document.createElement('button')
  saveForLater.className = 'results-button save-for-later';
  saveForLater.innerHTML = 'Save for later';

  saveForLater.onclick = () => {
    var resultArray = [['Date', 'Headline', 'Pos/Neg', 'Source'],
    ...headlines.map(h => [
      wrapWithQuotes(h.dateTime),
      wrapWithQuotes(h.headline),
      wrapWithQuotes(''),
      wrapWithQuotes(h.source)])]

    let csvContent = toCsv(resultArray);

    var currentDate = getCurrentDateString();
    var country = getCountry();

    download(`${country}_${currentDate}.csv`, csvContent)
  }

  document.body.appendChild(saveForLater);

  function toCsv(array) {
    return array.map(e => e.join(",")).join("\n");
  }

  function getCountry() {
    return Object.fromEntries([...new URLSearchParams(location.search)]).gl;
  }
  function getCurrentDateString() {
    return new Date().toUTCString("uk-UA").replaceAll(',', '').replaceAll(' ', '_');
  }

  function wrapWithQuotes(text) {
    return `"${text.replaceAll(`"`, `""`)}"`
  }

})()