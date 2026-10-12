interface NodemailerModule {
  default: {
    createTransport(options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }): {
      sendMail(options: {
        from: string;
        to: string;
        subject: string;
        html: string;
        replyTo: string;
      }): Promise<unknown>;
    };
  };
}

export async function loadNodemailer(): Promise<NodemailerModule | null> {
  try {
    const moduleName = 'nodemailer';
    return (await import(moduleName)) as NodemailerModule;
  } catch {
    return null;
  }
}
