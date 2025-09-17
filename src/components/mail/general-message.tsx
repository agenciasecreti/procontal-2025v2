export default function GeneralMessage({
  form,
}: {
  form: { name: string; phone: string; email: string; message: string };
}) {
  return `
        <div style="background-color: #f9f9f9;font-family: Arial, sans-serif;font-size: 14px;color: #5b5b5b;height: 100%;width: 100%;padding: 10px;overflow: hidden;">
            <div style="max-width: 600px;margin: 10px auto;background-color: #fff;padding: 20px;border-radius: 8px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}">
                    <img alt="${process.env.NEXT_PUBLIC_SITE_NAME}" src="${process.env.NEXT_PUBLIC_SITE_URL}/logo-1.webp" style="width: 200px; height: auto; display: block; margin: 40 auto;">
                </a>    
                <div style="padding: 40px; padding-top: 0px;">
                    ${form.message}
                </div>
            </div>
        </div>
    `;
}
