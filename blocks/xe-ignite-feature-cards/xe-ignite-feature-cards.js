import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  const [headingRow, subheadingRow, ...cardRows] = rows;

  const header = document.createElement('div');
  header.className = 'xe-ignite-feature-cards-header';

  if (headingRow) {
    const heading = document.createElement('h2');
    heading.className = 'xe-ignite-feature-cards-heading';
    heading.textContent = headingRow.textContent.trim();
    moveInstrumentation(headingRow, heading);
    header.append(heading);
  }

  if (subheadingRow) {
    const subheading = document.createElement('div');
    subheading.className = 'xe-ignite-feature-cards-subheading';
    while (subheadingRow.firstChild) subheading.append(subheadingRow.firstChild);
    moveInstrumentation(subheadingRow, subheading);
    header.append(subheading);
  }

  const ul = document.createElement('ul');
  ul.className = 'xe-ignite-feature-cards-list';

  cardRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'xe-ignite-feature-card';

    const [titleCell, bodyCell, linkCell] = [...row.children];

    if (titleCell) {
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'xe-ignite-feature-card-title';
      cardTitle.textContent = titleCell.textContent.trim();
      li.append(cardTitle);
    }

    if (bodyCell) {
      const body = document.createElement('div');
      body.className = 'xe-ignite-feature-card-body';
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
      li.append(body);
    }

    const link = linkCell?.querySelector('a');
    if (link) {
      link.className = 'xe-ignite-feature-card-link';
      const wrapper = document.createElement('div');
      wrapper.className = 'xe-ignite-feature-card-cta';
      wrapper.append(link);
      li.append(wrapper);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(header, ul);
}
