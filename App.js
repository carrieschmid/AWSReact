import React from "react";
import { StyleSheet, Text, TextInput, Button, View } from "react-native";
import Amplify from "@aws-amplify/core";
import config from "./aws-exports";
Amplify.configure(config);
import API, { graphqlOperation } from "@aws-amplify/api";
// API and graphqlOperation helpers from @aws-amplify/api help you execute any query on performing an action, such as fetching books or any mutation such as creating a new record.

const Listbooks = `
    query {
      listBooks {
        items {
          id name description
        }
      }
    }
    `;

const AddBook = `
mutation ($name: String! $description: String) {
  createBook(input: {
    name: $name
    description: $description
  }) {
    id name description
  }
}
`;

export default class App extends React.Component {
  state = {
    name: "",
    description: "",
    books: []
  };

  async componentDidMount() {
    try {
      const books = await API.graphql(graphqlOperation(ListBooks));
      console.log("books: ", books);
      this.setState({ books: books.data.listBooks.items });
    } catch (err) {
      console.log("error: ", err);
    }
  }

  onChangeText = (key, val) => {
    this.setState({ [key]: val });
  };

  addBook = async () => {
    if (this.state.name === "" || this.state.description === "") return;
    const book = {
      name: this.state.name,
      description: this.state.description
    };
    try {
      const books = [...this.state.books, book];
      this.setState({ books, name: "", description: "" });
      await API.graphql(graphqlOperation(AddBook, book));
      console.log("success");
    } catch (err) {
      console.log("error: ", err);
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={this.state.name}
          onChangeText={(val) => this.onChangeText("name", val)}
          placeholder="What do you want to read?"
        />
        <TextInput
          style={styles.input}
          value={this.state.description}
          onChangeText={(val) => this.onChangeText("description", val)}
          placeholder="Who wrote it?"
        />
        <Button onPress={this.addBook} title="Add to TBR" color="#eeaa55" />
        {this.state.books.map((book, index) => (
          <View key={index} style={styles.book}>
            <Text style={styles.name}>{book.name}</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        ))}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 50
  },
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: "blue",
    marginVertical: 10
  }
});
