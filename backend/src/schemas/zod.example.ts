// Zod is primarily a runtime validation library, but its schemas can also transform/coerce the input and produce the resulting data.


// parse() throws an exception when validation fails.

// safeParse() gives us:
// {
//     success: true,
//     data: ...
// }
// or:
// {
//     success: false,
//     error: ...
// }



import { z } from "zod";

const registerSchema = z.object({
    username: z
        .string()
        .min(2, "Username must be at least 2 characters")
        .max(20, "Username must be no more than 20 characters"),

    email: z
        .string()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

const result = registerSchema.parse({
    username: "  Kunal  ",
    email: "  KUNAL@Example.COM  ",
    password: "password123",
});

console.log(result);



// import { z } from "zod";

// const registerSchema = z.object({
//     username: z
//         .string()
//         .trim()
//         .min(2, "Username must be at least 2 characters")
//         .max(20, "Username must be no more than 20 characters"),

//     email: z
//         .string()
//         .trim()
//         .toLowerCase()
//         .email("Invalid email address"),

//     password: z
//         .string()
//         .min(8, "Password must be at least 8 characters"),
// });

// const result = registerSchema.safeParse({
//     username: "  Kunal  ",
//     email: "  KUNAL@Example.COM  ",
//     password: "password123",
// });

// if (result.success) {
//     console.log(result.data);
// }