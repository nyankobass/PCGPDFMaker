import * as PDFMake from 'pdfmake/build/pdfmake'

interface CardData {
    imgStr: string; /* base64 でエンコーディングされた画像データ */
    count: number;  /* カードの枚数 */
}

/* html から カードデータを取得する。 */
function getCardDataList(): CardData[] {
    const cardImagesView = document.getElementById("cardImagesView");

    if (!cardImagesView) {
        console.error("failed to get element [cardImagesView]");
        return;
    }

    const cardElementList = Array.from(cardImagesView.getElementsByClassName("Grid_item"));

    const cardDataList: CardData[] = cardElementList.map((element) => {
        const imgElement = element.getElementsByTagName("img");

        if (imgElement.length === 0) {
            return { imgStr: "", count: 0 };
        }

        const imgStr = imageToBase64(imgElement[0]);
        const count = parseInt(element.textContent.replace(/.*(¥d)枚.*/g, "$1"));

        return { imgStr: imgStr, count: count };
    })

    return cardDataList.filter((cardData) => { return cardData.count > 0 });
}

/* 画像をBase64にエンコード */
function imageToBase64(img: HTMLImageElement): string {
    // New Canvas
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    // Draw Image
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // To Base64
    return canvas.toDataURL("image/jpeg");
}


/* PDF の構造を作成 */
function createDocDefinition(imgStrList: string[]): PDFMake.TDocumentDefinitions {
    //===================================
    // 各種寸法作成
    //===================================
    const MM2PT = 1 / 0.35278;
    const cardWidth = 63 * MM2PT;

    // 各種マージン
    const pageMargin = 7 * MM2PT;
    const cardMargin = 3 * MM2PT;

    const widthMargin = {
        text: "",
        width: cardMargin
    };
    const heightMargin =
    {
        columns: [
            {
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=",
                width: cardMargin,
            }
        ]
    };

    var content = Array();
    var columns = Array();
    imgStrList.forEach((imgStr, index) => {
        columns.push({
            image: imgStr,
            width: cardWidth
        });
        columns.push(widthMargin);

        if ((index + 1) % 3 !== 0) {
            return;
        }

        content.push({
            columns: columns,
        });
        content.push(heightMargin);
        columns = Array();
    })

    // pdf設定
    const docDefinition = {
        pageSize: "A4" as any,
        pageMargins: pageMargin,
        content: content
    };

    return docDefinition;
}

/* PDF を作成 */
function printPDF() {
    /* CardData の一覧を取得する */
    const cardDataList = getCardDataList();

    /* 画像のURLを直列に並べる */
    var imgStrList: string[] = Array();
    cardDataList.forEach((cardData) => {
        for (var count = 0; count < cardData.count; count++) {
            imgStrList.push(cardData.imgStr);
        }
    })

    /* 印刷設定取得 */
    const docDefinition = createDocDefinition(imgStrList);

    /* pdf 生成 */
    PDFMake.createPdf(docDefinition).open();
}


/* ボタンを追加する */
function addCreatePDFButton() {
    const deckTableElementList = document.getElementsByClassName("DeckTablesGrid");
    const deckTableList = Array.from(deckTableElementList);

    var targetDeckTable: Element;
    deckTableList.forEach((element) => {
        if (!element.innerHTML.match("デッキシート")) {
            return;
        }

        targetDeckTable = element;
    });

    const text = '<button class="Button Button-texture noLinkBtn" id="createPDFBtn"><span class="bebel ">&nbsp;デッキシートをＰＤＦで保存する&nbsp;&nbsp;</span></button>';
    const gridElementList = targetDeckTable.getElementsByClassName("Grid_item");
    const gridList = Array.from(gridElementList);

    gridList.forEach((grid, index) => {
        if (index === 1) {
            grid.innerHTML = text;

            document.getElementById("createPDFBtn").onclick = ()=>{
                printPDF()
            };
        }
    });
}

window.onload = () => {
    /* PDF作成ボタンを追加する。 */
    addCreatePDFButton();

}