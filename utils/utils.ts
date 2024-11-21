/**
 * Split the string into sentences
 * @param string
 * @returns
 */
export function splitIntoSentences(string: string): string[] {
  const sentences = new Intl.Segmenter('en', {
    granularity: 'sentence',
  }).segment(string);
  return Array.from(sentences, (sentence): string => sentence.segment);
}

/**
 * Split the string into sentences
 * @param string
 * @returns Array of sentences
 */
export function splitHTMLIntoSentences(string: string): HTMLParagraphElement[] {
  const dom = new DOMParser().parseFromString(string, 'text/html');
  console.log('dom', dom);
  // If there are p tags then split by p tags otherwise split by groups of threesentences and then wrap them in p tags
  const pTags = dom.querySelectorAll('p');
  if (pTags.length > 1) {
    return Array.from(pTags);
  } else {
    const sentences = Array.from(
      new Intl.Segmenter('en', {
        granularity: 'sentence',
      }).segment(pTags[0].innerHTML),
    );
    return sentences?.map((sentence: any): HTMLParagraphElement => {
      const p: HTMLParagraphElement = document.createElement('p');
      p.innerHTML = sentence.segment;
      return p;
    });
  }
}

/**
 * Split the string into paragraphs
 * @param string
 * @returns Array of paragraphs
 */
export function splitIntoHTMLParagraphs(
  string: string,
): HTMLParagraphElement[] {
  const sentences = splitIntoSentences(string);
  return sentences?.map((sentence: any): HTMLParagraphElement => {
    const p: HTMLParagraphElement = document.createElement('p');
    p.innerHTML = sentence.segment;
    return p;
  });
}
