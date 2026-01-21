import { jsPDF } from 'jspdf'

export function ConvertToPdf(data) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4'
  })

  doc.save('test')
}
