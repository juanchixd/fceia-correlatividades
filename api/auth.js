import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { action, legajo, password, data, question, answer, newPassword } =
    req.body;

  try {
    // NORMALIZACIÓN DEL LEGAJO (La clave para g-5506/9 == G-5506/9)
    // Convertimos a string, quitamos espacios y pasamos a minúsculas
    const cleanLegajo = legajo ? legajo.toString().trim().toLowerCase() : "";

    // Conexión a Google Sheets
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth,
    );
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const userRow = rows.find((row) => {
      const rowLegajo = row.get("legajo");
      return (
        rowLegajo && rowLegajo.toString().trim().toLowerCase() === cleanLegajo
      );
    });

    // --- ACCIÓN: LOGIN / REGISTRO ---
    if (action === "login") {
      if (!userRow) {
        // REGISTRO NUEVO
        if (!question || !answer) {
          return res
            .status(400)
            .json({ error: "Falta pregunta de seguridad para registro nuevo" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedAnswer = await bcrypt.hash(answer.toLowerCase().trim(), 10);

        await sheet.addRow({
          legajo: cleanLegajo, // Guardamos siempre en minúsculas para mantener consistencia
          password: hashedPassword,
          data: JSON.stringify(data || {}),
          security_question: question,
          security_answer: hashedAnswer,
        });
        return res.status(200).json({ status: "created", data: data || {} });
      } else {
        // LOGIN EXISTENTE
        const match = await bcrypt.compare(password, userRow.get("password"));
        if (!match)
          return res.status(401).json({ error: "Contraseña incorrecta" });

        const cloudData = JSON.parse(userRow.get("data") || "{}");
        return res.status(200).json({ status: "logged_in", data: cloudData });
      }
    }

    // --- ACCIÓN: OBTENER PREGUNTA ---
    if (action === "get_question") {
      if (!userRow)
        return res.status(404).json({ error: "Usuario no encontrado" });
      return res
        .status(200)
        .json({ question: userRow.get("security_question") });
    }

    // --- ACCIÓN: RESETEAR PASSWORD ---
    if (action === "reset_password") {
      if (!userRow)
        return res.status(404).json({ error: "Usuario no encontrado" });

      const match = await bcrypt.compare(
        answer.toLowerCase().trim(),
        userRow.get("security_answer"),
      );
      if (!match)
        return res
          .status(401)
          .json({ error: "Respuesta de seguridad incorrecta" });

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      userRow.set("password", newHashedPassword);
      await userRow.save();

      return res.status(200).json({ status: "password_reset" });
    }

    // --- ACCIÓN: GUARDAR DATOS ---
    if (action === "save") {
      if (!userRow)
        return res.status(404).json({ error: "Usuario no encontrado" });

      userRow.set("data", JSON.stringify(data));
      await userRow.save();
      return res.status(200).json({ status: "saved" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error de servidor: " + error.message });
  }
}
