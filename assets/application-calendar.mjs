// Dates without a published hour stay all-day dates in the exported calendar.
export const deadlineTime = value => Date.parse(value.length === 10 ? value + 'T23:59:59.999+08:00' : value);
export const openingTime = value => Date.parse(value.length === 10 ? value + 'T00:00:00+08:00' : value);
export function applicationStatus(item, now = Date.now()) {
  const last = item.recommendationDeadline || item.applicationDeadline;
  if (now > deadlineTime(last)) return { id: 'closed', label: '已结束' };
  if (now < openingTime(item.opensAt)) return { id: 'upcoming', label: '即将开放' };
  if (item.applicationDeadline && now > deadlineTime(item.applicationDeadline)) return { id: 'review', label: '推荐阶段' };
  return { id: 'open', label: '申报中' };
}
export function applicationMilestones(item) {
  return [
    item.applicationDeadline && { id: 'application', label: '申报单位截止', date: item.applicationDeadline },
    item.recommendationDeadline && { id: 'recommendation', label: item.recommendationLabel || '审核推荐截止', date: item.recommendationDeadline }
  ].filter(Boolean);
}
export function formatApplicationDate(value) {
  return value.slice(0, 10).replaceAll('-', '.') + (value.length > 10 ? ' ' + value.slice(11, 16) : '');
}
export function applicationReminderTime(item, milestoneId, leadDays) {
  const milestone = applicationMilestones(item).find(value => value.id === milestoneId);
  if (!milestone) throw new Error('Invalid reminder milestone');
  const start = Date.parse(milestone.date.length === 10 ? milestone.date+'T00:00:00+08:00' : milestone.date);
  return start - Number(leadDays) * 86400000;
}
const escapeICS = value => String(value).replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(';', '\\;').replaceAll(',', '\\,');
export function createApplicationCalendar(item, milestoneId, leadDays = 7, now = new Date()) {
  const milestone = applicationMilestones(item).find(value => value.id === milestoneId);
  if (!milestone || ![3, 7, 14].includes(Number(leadDays))) throw new Error('Invalid reminder');
  const date = milestone.date;
  const timed = date.length > 10;
  const utc = value => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shaoyang Wang//Zhejiang Applications//ZH', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    'UID:' + item.id + '-' + milestone.id + '@shaoyang-wang.local', 'DTSTAMP:' + utc(now),
    timed ? 'DTSTART:' + utc(new Date(date)) : 'DTSTART;VALUE=DATE:' + date.replaceAll('-', ''),
    'SUMMARY:' + escapeICS(item.title + ' · ' + milestone.label),
    'DESCRIPTION:' + escapeICS(milestone.label + '：' + formatApplicationDate(date) + '\n官方通知：' + item.sourceUrl),
    'URL:' + item.sourceUrl, 'TRANSP:TRANSPARENT', 'BEGIN:VALARM', 'ACTION:DISPLAY',
    'DESCRIPTION:' + escapeICS(item.title + ' · ' + milestone.label), 'TRIGGER:-P' + Number(leadDays) + 'D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
  // RFC 5545 folds at 75 UTF-8 octets, preserving Chinese code points.
  const encoder = new TextEncoder();
  return lines.map(line => {
    let output = '', chunk = '', bytes = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (bytes + size > 75) { output += chunk + '\r\n'; chunk = ' '; bytes = 1; }
      chunk += character; bytes += size;
    }
    return output + chunk;
  }).join('\r\n') + '\r\n';
}
