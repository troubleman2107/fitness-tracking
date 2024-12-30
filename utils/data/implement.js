const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const supabase = require("../../src/lib/supabaseClientJS");
const uuid = require("uuid");

// Bucket configuration
const BUCKET_NAME = "exercise-images";

// Main function
(async () => {
  try {
    // Load JSON data
    const rawData = await fs.readFile(
      path.resolve(__dirname, "./exercises.json"),
      "utf-8"
    );
    const data = JSON.parse(rawData);

    // Calculate total items to process
    const totalMuscleGroups = data.length;
    let totalExercises = 0;
    data.forEach((mg) => (totalExercises += mg.exercises.length));
    const totalItems = totalMuscleGroups + totalExercises * 2; // Including equipment images

    let processedItems = 0;

    console.log(
      `Starting to process ${totalMuscleGroups} muscle groups with ${totalExercises} exercises...`
    );

    // Process each muscle group
    for (let i = 0; i < data.length; i++) {
      const muscleGroup = data[i];
      console.log(
        `\nProcessing muscle group ${i + 1}/${totalMuscleGroups}: ${
          muscleGroup.name
        }`
      );

      // Upload muscle group image
      const muscleGroupImageUrl = await uploadImage(
        muscleGroup.img,
        "muscle-groups"
      );
      muscleGroup.img = muscleGroupImageUrl;
      processedItems++;
      console.log(
        `Progress: ${Math.round((processedItems / totalItems) * 100)}%`
      );

      // Process exercises
      for (let j = 0; j < muscleGroup.exercises.length; j++) {
        const exercise = muscleGroup.exercises[j];
        console.log(
          `  Processing exercise ${j + 1}/${muscleGroup.exercises.length}: ${
            exercise.name
          }`
        );

        // Upload exercise image
        const exerciseImageUrl = await uploadImage(exercise.img, "exercises");
        exercise.img = exerciseImageUrl;
        processedItems++;
        console.log(
          `Progress: ${Math.round((processedItems / totalItems) * 100)}%`
        );

        // Upload equipment image
        const equipmentImageUrl = await uploadImage(
          exercise.equipment.img,
          "equipment"
        );
        exercise.equipment.img = equipmentImageUrl;
        processedItems++;
        console.log(
          `Progress: ${Math.round((processedItems / totalItems) * 100)}%`
        );
      }
    }

    // Save updated JSON to a file
    await fs.writeFile(
      "./updated_exercises.json",
      JSON.stringify(data, null, 2)
    );

    console.log("\n✅ All images uploaded and JSON updated successfully!");
  } catch (error) {
    console.error("\n❌ Error processing images:", error.message);
    if (error.stack) console.error(error.stack);
  }
})();

// Function to upload an image and return the new URL
async function uploadImage(imageUrl, folder) {
  if (imageUrl !== "") {
    try {
      console.log(
        `    Uploading image to ${folder}: ${path.basename(imageUrl)}`
      );
      const decodedUrl = decodeURIComponent(imageUrl);
      const nameOfImg = decodedUrl.match(/\/([^\/?#]+\.(jpg|png))/)
        ? decodedUrl.match(/\/([^\/?#]+\.(jpg|png))/)[1]
        : "";
      console.log("🚀 ~ uploadImage ~ nameOfImg:", nameOfImg);

      // Fetch image data
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data, "binary");

      // Create a unique filename
      const fileName = path.basename(nameOfImg).split("?")[0];
      const filePath = `${"folder_" + folder}/${"img_" + nameOfImg}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, imageBuffer, {
          contentType: response.headers["content-type"],
          upsert: true,
        });

      if (error) throw new Error(error.message);

      // Return the public URL
      const { publicURL } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      return publicURL;
    } catch (error) {
      console.error(`    ❌ Error uploading image: ${imageUrl}`, error.message);
      throw error;
    }
  }
  return "";
}
