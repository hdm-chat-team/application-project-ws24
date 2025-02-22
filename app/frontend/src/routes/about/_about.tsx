import { createFileRoute } from "@tanstack/react-router";




function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-lg rounded-lg bg-white p-6 text-center shadow-lg">
        {/* Platzhalter für das Logo */}
        <div className="mb-4 h-24 w-24 rounded-full bg-gray-300" />

        <h1 className="mb-2 text-2xl font-bold">About GooseChef</h1>
        <p className="text-gray-600">
          This project was made for the <br />
          <span className="font-semibold text-green-500">
            software development 3 class
          </span>{" "}
          at Hochschule der Medien Stuttgart.
        </p>

        {/* Team-Mitglieder */}
        <ul className="mt-4 text-gray-700">
          <li>Deniz Gazitepe</li>
          <li>Bastian Seibel</li>
          <li>Biran Arslan</li>
          <li>Sabrina Turni</li>
          <li>Maria Alyssa Di Napoli</li>
        </ul>

        {/* Links */}
        <div className="mt-6 space-y-2">
          <a
            href="https://www.hdm-stuttgart.de/vorlesung_detail?vorlid=5215496"
            className="text-blue-500 hover:underline"
          >
            Link 1
          </a>
          <a
            href="https://www.hdm-stuttgart.de/"
            className="text-blue-500 hover:underline"
          >
            Link 2
          </a>
        </div>

        {/* Textfelder mit Links */}
        <div className="mt-6 space-y-2">
          <p className="text-gray-600">
            This project was made for{" "}
            <a href="https://example.com/info1" className="text-blue-500 hover:underline">
              this page
            </a>
            .
          </p>
          <p className="text-gray-600">
            To contact us, go to{" "}
            <a href="https://example.com/contact" className="text-blue-500 hover:underline">
              this page
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
