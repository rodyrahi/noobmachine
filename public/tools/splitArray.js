function splitArray(array , train) {
    // Shuffle the array randomly
    const shuffledArray = array.sort(() => Math.random() - 0.5);
  
    // Calculate the split index based on the 70-30 ratio
    const splitIndex = Math.floor(array.length * train);
  
    // Split the array into two parts
    const array70 = shuffledArray.slice(0, splitIndex);
    const array30 = shuffledArray.slice(splitIndex);
  

    console.log(array70);
    // Return the two split arrays
    return [array70, array30];
  }
  