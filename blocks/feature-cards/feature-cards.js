import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  const [labelRow, titleRow, subtitleRow, ...cardRows] = rows;

  const header = document.createElement('div');
  header.className = 'feature-cards-header';

  if (labelRow) {
    const label = document.createElement('p');
    label.className = 'feature-cards-label';
    label.textContent = labelRow.textContent.trim();
    moveInstrumentation(labelRow, label);
    header.append(label);
  }

  if (titleRow) {
    const title = document.createElement('h2');
    title.className = 'feature-cards-title';
    title.textContent = titleRow.textContent.trim();
    moveInstrumentation(titleRow, title);
    header.append(title);
  }

  if (subtitleRow) {
    const subtitle = document.createElement('div');
    subtitle.className = 'feature-cards-subtitle';
    while (subtitleRow.firstChild) subtitle.append(subtitleRow.firstChild);
    moveInstrumentation(subtitleRow, subtitle);
    header.append(subtitle);
  }

  const ul = document.createElement('ul');

  cardRows.slice(0, 2).forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'feature-card';

    const [iconCell, titleCell, bodyCell, linkCell] = [...row.children];

    if (iconCell) {
      const icon = document.createElement('div');
      icon.className = 'feature-card-icon';
      icon.textContent = iconCell.textContent.trim();
      li.append(icon);
    }

    if (titleCell) {
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'feature-card-title';
      cardTitle.textContent = titleCell.textContent.trim();
      li.append(cardTitle);
    }

    if (bodyCell) {
      const body = document.createElement('div');
      body.className = 'feature-card-body';
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
      li.append(body);
    }

    const link = linkCell?.querySelector('a');
    if (link) {
      link.className = 'feature-card-link';
      li.append(link);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(header, ul);
}
