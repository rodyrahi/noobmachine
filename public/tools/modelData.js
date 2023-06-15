function getXsandYs(lines , xs ,ys) {
        for (let i = 0; i < lines.length; i++) {
      

        inputs = lines.slice(0, -1);

        const valueSelect = document.getElementById('predict-param').options[document.getElementById('predict-param').selectedIndex].value
        const header = lines[0]

        var paramindex 
        header.forEach((element , index) => {
            if (element.replace(/\s/g, "") === valueSelect.replace(/\s/g, "")) {
            paramindex = index
            }
        });
        

        var features = lines[i].filter((_, i) => i !== paramindex);
        var target = lines[i].filter((_, i) => i == paramindex);
        xs.push(features); // Store features
        ys.push(target);
        }

        

}