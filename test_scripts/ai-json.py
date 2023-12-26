from openai import OpenAI
client = OpenAI()

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

# models are the models that the AI can use to generate the response.
# 
# "gpt-4-1106-preview" Input: $0.01 / 1K tokens Output: $0.03 / 1K tokens
# "gpt-3.5-turbo-1106" Input: $0.001 / 1K tokens Output: $0.002 / 1K tokens
models = [
    {
        "name": "gpt-4-1106-preview",
        "input": 0.01,
        "output": 0.03
    },
    {
        "name": "gpt-3.5-turbo-1106",
        "input": 0.001,
        "output": 0.002
    }
]

# messages are the messages that the AI will use to generate the response.
# The first message is the prompt, and the rest are the context. As more
# messages are added, the context will accumulate. The max number of messages
# (prompt + context) is 8. Each message must be a dictionary with a "role" key
# and a "content" key. The role can be "system" or "user". The system messages
# should describe the task to be performed. The user messages should be what
# the user says in response to the task.
messages=[
    {"role": "system", "content": "You are a software architecture expert designed to output JSON. You are asked to output a JSON object with the following properties: applications (list of application objects), and connections (list of connection objects). An application object has the following properties: name (string), color (hex string), servers (list of server objects), position (a list of 3 ints), rotation (a list of 3 ints between 0 and 360), scale (a list of 3 floats between 1 and 5), geometry (string with a value of any box, capsule, circle, cone, cylinder, dodecahedron, icosahedron, octahedron, plane, ring, sphere, tetrahedron, torus, torusKnot. Default is box). A server object has the following properties: name (string). A connection object has the following properties: source (an application name string), target (an application name string). The connection.source shows which application will establish the connection to the connection.target. Applications should be positioned close to each other with a gap of around 10 assuming that their size is 1x1x1 initially."},

    {"role": "user", "content": "Generate an example architecture for a social media style application. The website should have systems that handle user authentication, user profiles, and user posts. Load balancers should be used to distribute traffic between the servers. Each application should have its own named load balancer that other applications can use to access it. Include the load balancers in the JSON output."}
]

# max_messages is the maximum number of messages that the AI will use to
# generate the response. The prompt counts as one message, and each context
# message counts as one message. This max also inlcudes the response message.
max_messages = 8

# chosen_model is the model that the AI will use to generate the response.
chosen_model = "gpt-3.5-turbo-1106"

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------

# Print a message in bold text.
def print_bold(message):
    print("\033[1m" + message + "\033[0m")

# Get next message from user.
def get_next_message():
    content = input()
    if content == "":
        print("No message entered. Exiting.")
        return False
    return { "role": "user", "content": content }

# generate_response generates a response from the AI.
def generate_response(messages):
    # return {
    #     "choices": [
    #         {
    #             "message": {
    #                 "content": "The AI generated this response.",
    #                 "role": "system"
    #             }
    #         }
    #     ]
    # }
    return client.chat.completions.create(
        model=chosen_model,
        messages=messages,
        response_format={ "type": "json_object" },
        max_tokens=2000,
        temperature=0.3,
    )

# -----------------------------------------------------------------------------
# Entry point
# -----------------------------------------------------------------------------

print_bold("Model: ")
print_bold("======")
print(chosen_model)
print("")

print_bold("Prompt:")
print_bold("=======")
print(messages[0]["content"])
print("")

print_bold("Initial Request:")
print_bold("================")
for message in messages[1:]:
    print(message["content"])
print("")

print_bold("Response:")
print_bold("=========")
response = generate_response(messages)
message = response.choices[0].message
messages.append(message)
print(message.content)
print("")

# Loop over the chat until the user enters an empty message or
# the max number of messages is reached.
while len(messages) < max_messages:
    # Get the next message from the user
    print_bold("Next Message: (Press Enter to exit)")
    print_bold("===================================")
    next = get_next_message()
    print("")
    if not next:
        break

    # Append the message to the messages.
    messages.append(next)

    # Generate the response from the AI.
    print_bold("Response:")
    print_bold("=========")
    response = generate_response(messages)
    message = response.choices[0].message
    messages.append(message)
    print(message.content)
    print("")


