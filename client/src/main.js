import { useState } from "react";
import { Button, Checkbox, Form, Input, Row, Col, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
const { Dragger } = Upload;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
export const Main = () => {
  const [file, setFile] = useState(null);
  const [txhash, setTxhash] = useState("");
  const [publicKey, setPubK] = useState("");
  const [privateKey, setPrivK] = useState("");

  const draggerProps = {
    name: "file",
    multiple: true,

    onChange(info) {
      const { status, originFileObj } = info.file;

      if (status === "uploading") {
        // getBase64(info.file.originFileObj)
        //   .then((blob) => {
        //     fetch("http://localhost:3001/upload", {
        //       method: "POST",
        //       body: JSON.stringify({ blob, type: originFileObj.type }),
        //       headers: { "Content-Type": "application/json" },
        //     });
        //   })
        //   .then((res) => {
        //     message.success(`${info.file.name} file uploaded successfully.`);
        //   })
        //   .catch((e) => {
        //     message.error(`${info.file.name} file upload failed.`);
        //   });

        // return true;
        getBase64(info.file.originFileObj).then((base64) => {
          setFile({ base64, type: originFileObj.type, name: info.file.name });
        });
      }
    },

    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };
  const onMint = () => {
    // fetch("http://localhost:3001/mint", {
    fetch("https://horizonft-server.herokuapp.com/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: publicKey,
        privateKey: privateKey,
        fileDto: file,
      }),
    }).then(async (res) => {
      const data = await res.json();
      setTxhash(data.txhash);
    });
  };
  return (
    <Row style={{ justifyContent: "center" }}>
      <Col span={10}>
        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
        >
          <Form.Item label="Public key" name="public_key">
            <Input onChange={(ev) => setPubK(ev.target.value)} />
          </Form.Item>

          <Form.Item label="Private key" name="private_key">
            <Input onChange={(ev) => setPrivK(ev.target.value)} />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            {/* <Button type="primary" htmlType="submit">
              Submit
            </Button> */}
          </Form.Item>
        </Form>

        {/* <div
          className="contract"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <span>Contract address:</span>
          <Typography.Text mark strong style={{ marginLeft: ".5rem" }}>
            contract address
          </Typography.Text>
        </div> */}
        <div
          className="transaction"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <span>Transaction hash:</span>
          <Typography.Text mark strong style={{ marginLeft: ".5rem" }}>
            {txhash}
          </Typography.Text>
        </div>

        <div className="minter" style={{ marginTop: "2rem" }}>
          <Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from
              uploading company data or other band files
            </p>
          </Dragger>

          <Button type="primary" htmlType="submit" onClick={() => onMint()}>
            Mint
          </Button>
        </div>
      </Col>
    </Row>
  );
};
