import { EmailAlertType } from "@/lib/types";
import emailjs from "@emailjs/browser";

const service = import.meta.env.VITE_EMAIL_SERVICE;
const templete = import.meta.env.VITE_EMAIL_TEMPLATE;
export const EmailAlertFunction = (data: EmailAlertType) => {
  // console.log("tested");
  emailjs.init({
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  });

  emailjs.send(service, templete, {
    to_email: data.to_email,
    from_email: data.from_email,
    name: data.name,
    email: data.email,
    priority: data.priority,
    task_description: data.task_description,
    task_title: data.task_title,
    team_lead_initial: data.team_lead_initial,
    team_lead_name: data.team_lead_name,
    created_date: data.created_date,
    due_date: data.due_date,
    task_url: data.task_url,
  });
};
