import DSLTemplates from '../dsl-templates/register';

export async function getDSLTemplate(type: string) {
  const template = DSLTemplates[type];
  if(!template) {
    console.error(`找不到模版${type}`);
    return '';
  }
  return template;
}