import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Container,
  CardMedia,
  Chip,
} from "@mui/material";
{/*import { Link as RouterLink } from "react-router-dom";*/}

{/* For the proof of concept demo using a carousel */}
import { useState } from "react";

{/* Data for demo profiles */}

type Profile = {
  id: number;
  name: string;
  age: number;
  degree: string;
  bio: string;
  interests: string[],
}

const demo: Profile[] = [
  { id: 1, 
    name: "Jeff", 
    age: 20, 
    degree: "Information Technology", 
    bio: "I enjoy nature and going for walks.", 
    interests: ["Walking", "Nature", "Coding"]
  },
  { id: 2, 
    name: "Ben", 
    age: 24, 
    degree: "Computer Science", 
    bio: "I love game jams.", 
    interests: ["Coding", "Baking", "Tennis"]
  },
  { id: 3, 
    name: "Sarah", 
    age: 21, 
    degree: "Data Analytics", 
    bio: "I love breathing air.", 
    interests: ["Swimming", "Photography", "Robotics"]
  },
]

{/* Inline CSS for first prototype demo */}

export default function Matching() {

  {/* Carousel demo code - can remove later */}
  const [i, setI] = useState(0);
  const cur = demo[i];

  const prev = () => setI((n) => (n - 1 + demo.length) % demo.length);
  const next = () => setI((n) => (n + 1) % demo.length);

  return (
    <Box
      sx={{ flexGrow: 1 }}
    >
      <Container maxWidth="xl" sx={{ mb: 4, mt: 6 }}>
        
        <Typography variant="h4" gutterBottom sx={{ mb: 8}}>
          Matching
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent={"center"}>
          <Card sx={{ 
                    /*flex: 1*/
                    width: {xs: "100%", sm: 640}, 
                    mx: "auto",
                    borderRadius: 4,
                    }}>
            
            <CardMedia
              component={"img"}
              image="/blank profile.png"
              alt="Profile Photo here."
              sx={{height: {xs: 280, sm: 360 }}}
            />

            <CardContent>
              {/* Profile Details */}
              <Typography variant="h5" sx={{ fontWeight: 700}}>
                {cur.name} {cur.age}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1}}>
                {cur.degree}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, mb: 2}}>
                {cur.bio}
              </Typography>

              <Stack direction={"row"} spacing={1} justifyContent="center" sx={{ flexWrap: "wrap", mb: 3}}>
                {cur.interests.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Stack>
              
              {/* Buttons */}
              <Stack direction={"row"} spacing={3} justifyContent={"center"}>
                <Button
                  onClick={prev}
                  style={{backgroundColor: "red"}} 
                  variant="contained" 
                  sx={{ minWidth: 120, py: 1.2 }}
                >
                  Dislike
                </Button>

                <Button 
                  onClick={next}
                  style={{backgroundColor: "green"}} 
                  variant="contained" 
                  sx={{ minWidth: 120, py: 1.2 }}
                >
                  Like
                </Button>
              </Stack>              
            </CardContent>
          </Card>

          
        </Stack>
      </Container>
    </Box>
  );
}
