import * as puppeteer from 'puppeteer';

interface Combination {
    gender: string; // '0': 여자, '1': 남자
    year: string; // 1918 ~ 2018
    month: string; // 1 ~ 12
    day: string; // 1 ~ 31
    hour: string; // 0 ~ 23
    minute: string; // 0 ~ 59
}

async function main() {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const combinations: Combination[] = [];
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
        const result = await page.evaluate(job, combination) as JobResult;
        await page.close();
        return [combination, result];
    }));
    console.log(results);
    await browser.close();
}

interface JobResult {
    abstract: string;
    luckys: string[];
}

const job = (combination: Combination) => new Promise<JobResult>(resolve => {
    const iframe = document.querySelector('iframe[name=SinsuUnse]') as HTMLIFrameElement;
    const form = iframe.contentDocument!.querySelector('form[name=frm]')!;
    const go = () => (iframe.contentWindow as any).go(form);
    const $ = form.querySelector.bind(form);
    const nameInput = $('input[name=name1]') as HTMLInputElement;
    const genderSelect = $('select[name=sex1]') as HTMLSelectElement;
    const yearSelect = $('select[name=byear1]') as HTMLSelectElement;
    const monthSelect = $('select[name=bmonth1]') as HTMLSelectElement;
    const daySelect = $('select[name=bday1]') as HTMLSelectElement;
    const hourSelect = $('select[name=bhour1]') as HTMLSelectElement;
    const minuteSelect = $('select[name=bminute1]') as HTMLSelectElement;
    const solRadio = $('#lunsol1_1') as HTMLInputElement;
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
        const content = iframe.contentDocument!.querySelector('#unseView') as HTMLDivElement;
        const tables = content.querySelectorAll('table');
        const abstract = tables[3].querySelectorAll('strong')[1].textContent!;
        const luckys = Array.from(
            tables[10].querySelectorAll('td')[4].querySelectorAll('strong'),
        ).map(strong => strong.nextSibling!.textContent!.replace(/^ : /, '').trim());
        resolve({
            abstract,
            luckys,
        });
    };
    go();
});

main();
