import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Avatar,
} from "@mui/material";


export default function ProfileCreation() {
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  const [photoFile, setPhotoFile] = React.useState<File | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const pickFile = () => fileInputRef.current?.click();
  const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    if (!/^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/.test(file.type)) return;

    // Max file size validation
    if (file.size > 5 * 1024 * 1024) {
      console.warn('Please choose an image under 5MB.');
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    setPhotoFile(file);
    setPhotoPreview(nextUrl);
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  React.useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const savePFP = () => {
    /* to be created later */
    if (photoFile) {
    }
  };

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create your profile
          </Typography>

          <Stack spacing={2}>
            
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={photoPreview ?? undefined}
                alt="Profile picture"
                sx={{ width: 96, height: 96, mx: 'auto', mb: 1 }}
              />
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="outlined" onClick={pickFile}>
                  {photoPreview ? 'Change photo' : 'Upload photo'}
                </Button>
                {photoPreview && (
                  <Button variant="text" color="error" onClick={clearPhoto}>
                    Remove
                  </Button>
                )}
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={fileChange}
              />
            </Box>

            <TextField label="Name" fullWidth />
            <TextField label="Age" type="number" fullWidth />
            <Autocomplete
              multiple
              options={interestsData}
              getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Interests"
                  placeholder="Select a few interests"
                />
              )}
            />

            <Button variant="contained" fullWidth onClick={savePFP}>
              Save Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

const interestsData = [
  { title: 'Traveling' },
  { title: 'Cooking' },
  { title: 'Baking' },
  { title: 'Hiking' },
  { title: 'Camping' },
  { title: 'Cycling' },
  { title: 'Running' },
  { title: 'Swimming' },
  { title: 'Yoga' },
  { title: 'Meditation' },
  { title: 'Gym/Fitness' },
  { title: 'Soccer' },
  { title: 'Basketball' },
  { title: 'Tennis' },
  { title: 'Volleyball' },
  { title: 'Surfing' },
  { title: 'Skiing' },
  { title: 'Snowboarding' },
  { title: 'Skateboarding' },
  { title: 'Martial Arts' },
  { title: 'Dancing' },
  { title: 'Singing' },
  { title: 'Playing Guitar' },
  { title: 'Playing Piano' },
  { title: 'Playing Drums' },
  { title: 'Listening to Music' },
  { title: 'Concerts' },
  { title: 'Photography' },
  { title: 'Videography' },
  { title: 'Drawing' },
  { title: 'Painting' },
  { title: 'Sculpting' },
  { title: 'Graphic Design' },
  { title: 'Fashion' },
  { title: 'Makeup' },
  { title: 'Hairstyling' },
  { title: 'Writing' },
  { title: 'Blogging' },
  { title: 'Reading' },
  { title: 'Poetry' },
  { title: 'Journaling' },
  { title: 'Gaming' },
  { title: 'Board Games' },
  { title: 'Card Games' },
  { title: 'Esports' },
  { title: 'Coding' },
  { title: 'Robotics' },
  { title: 'Astronomy' },
  { title: 'Science' },
  { title: 'History' },
  { title: 'Philosophy' },
  { title: 'Psychology' },
  { title: 'Languages' },
  { title: 'Learning New Skills' },
  { title: 'Volunteering' },
  { title: 'Charity Work' },
  { title: 'Politics' },
  { title: 'Entrepreneurship' },
  { title: 'Startups' },
  { title: 'Investing' },
  { title: 'Cryptocurrency' },
  { title: 'Cars' },
  { title: 'Motorcycles' },
  { title: 'Formula 1' },
  { title: 'Football (American)' },
  { title: 'Baseball' },
  { title: 'Cricket' },
  { title: 'Rugby' },
  { title: 'Table Tennis' },
  { title: 'Badminton' },
  { title: 'Golf' },
  { title: 'Fishing' },
  { title: 'Hunting' },
  { title: 'Archery' },
  { title: 'Gardening' },
  { title: 'Cooking International Foods' },
  { title: 'Wine Tasting' },
  { title: 'Beer Brewing' },
  { title: 'Tea Culture' },
  { title: 'Pets' },
  { title: 'Dogs' },
  { title: 'Cats' },
  { title: 'Birdwatching' },
  { title: 'Nature Walks' },
  { title: 'Astrology' },
  { title: 'Tarot' },
  { title: 'Spirituality' },
  { title: 'Technology' },
  { title: 'AI and Machine Learning' },
  { title: 'Virtual Reality' },
  { title: 'Movies' },
  { title: 'TV Shows' },
  { title: 'Anime' },
  { title: 'Comics' },
  { title: 'Manga' },
  { title: 'Podcasts' },
  { title: 'Stand-up Comedy' },
  { title: 'Theatre' },
  { title: 'Musicals' },
  { title: 'Museums' },
  { title: 'Art Galleries' },
  { title: 'Foodie Culture' },
  { title: 'Street Food' }
];
