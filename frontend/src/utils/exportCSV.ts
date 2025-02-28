export const exportCSV = (): void => {
    let csv = "Date,Station,Wind Speed\n";
    document.querySelectorAll("table tbody tr").forEach(row => {
        let cols = row.querySelectorAll("td");
        csv += `${cols[0].innerText},${cols[1].innerText},${cols[2].innerText}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
}