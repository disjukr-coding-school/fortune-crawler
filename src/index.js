const puppeteer = require('puppeteer');

async function main() {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const combinations = [];
    for (const gender of ['0', '1']) {
        for (const year of ['2018']) {
            for (const month of ['1']) {
                for (const day of ['1', '2']) {
                    for (const hour of ['0']) {
                        for (const minute of ['0']) {
                            combinations.push({
                                gender,
                                year,
                                month,
                                day,
                                hour,
                                minute,
                            });
                        }
                    }
                }
            }
        }
    }
    const results = await Promise.all(combinations.map(async combination => {
        const page = await browser.newPage();
        await page.goto('http://free.sinsu.net/');
        const result = await page.evaluate(job, combination);
        await page.close();
        return [combination, result];
    }));
    console.log(results);
    await browser.close();
}

const job = (combination) => new Promise(resolve => {
    const iframe = document.querySelector('iframe[name=SinsuUnse]');
    const form = iframe.contentDocument.querySelector('form[name=frm]');
    const go = () => (iframe.contentWindow).go(form);
    const $ = form.querySelector.bind(form);
    const nameInput = $('input[name=name1]');
    const genderSelect = $('select[name=sex1]');
    const yearSelect = $('select[name=byear1]');
    const monthSelect = $('select[name=bmonth1]');
    const daySelect = $('select[name=bday1]');
    const hourSelect = $('select[name=bhour1]');
    const minuteSelect = $('select[name=bminute1]');
    const solRadio = $('#lunsol1_1');
    { // 값 설정
        nameInput.value = '홍길동';
        genderSelect.value = combination.gender; // '0': 여자, '1': 남자
        yearSelect.value = combination.year; // 1918 ~ 2018
        monthSelect.value = combination.month; // 1 ~ 12
        daySelect.value = combination.day; // 1 ~ 31
        hourSelect.value = combination.hour; // 0 ~ 23
        minuteSelect.value = combination.minute; // 0 ~ 59
        solRadio.checked = true;
    }
    iframe.onload = () => {
        const content = iframe.contentDocument.querySelector('#unseView');
        const tables = content.querySelectorAll('table');
        const abstract = tables[3].querySelectorAll('strong')[1].textContent;
        const luckys = Array.from(
            tables[10].querySelectorAll('td')[4].querySelectorAll('strong'),
        ).map(strong => strong.nextSibling.textContent.replace(/^ : /, '').trim());
        resolve({
            abstract,
            luckys,
        });
    };
    go();
});

main();
