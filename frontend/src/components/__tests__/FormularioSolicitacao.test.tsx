import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioSolicitacao } from '../FormularioSolicitacao';
import '@testing-library/jest-dom';

describe('FormularioSolicitacao', () => {
  it('não mostra o campo de justificativa quando a prioridade não é URGENTE', () => {
    render(<FormularioSolicitacao aoSubmeter={vi.fn()} enviando={false} errosPorCampo={null} />);

    expect(screen.queryByLabelText(/justificativa da prioridade/i)).not.toBeInTheDocument();
  });

  it('mostra o campo de justificativa ao selecionar prioridade URGENTE', async () => {
    const user = userEvent.setup();
    render(<FormularioSolicitacao aoSubmeter={vi.fn()} enviando={false} errosPorCampo={null} />);

    await user.selectOptions(screen.getByLabelText(/^prioridade/i), 'URGENTE');

    expect(screen.getByLabelText(/justificativa da prioridade/i)).toBeInTheDocument();
  });

  it('envia os dados preenchidos, com justificativa nula quando a prioridade não é URGENTE', async () => {
    const aoSubmeter = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<FormularioSolicitacao aoSubmeter={aoSubmeter} enviando={false} errosPorCampo={null} />);

    await user.type(screen.getByLabelText(/nome do solicitante/i), 'Maria da Silva');
    await user.selectOptions(screen.getByLabelText(/categoria/i), 'CONSULTA');
    await user.selectOptions(screen.getByLabelText(/^prioridade/i), 'ALTA');
    await user.type(screen.getByLabelText(/descrição/i), 'Encaminhamento para consulta');

    await user.click(screen.getByRole('button', { name: /registrar solicitação/i }));

    await waitFor(() => expect(aoSubmeter).toHaveBeenCalledTimes(1));
    expect(aoSubmeter).toHaveBeenCalledWith({
      nome_solicitante: 'Maria da Silva',
      categoria: 'CONSULTA',
      prioridade: 'ALTA',
      descricao: 'Encaminhamento para consulta',
      justificativa_prioridade: null,
    });
  });

  it('exibe a mensagem de erro vinda do backend para um campo específico', () => {
    render(
      <FormularioSolicitacao
        aoSubmeter={vi.fn()}
        enviando={false}
        errosPorCampo={{ nome_solicitante: ['Informe o nome do solicitante.'] }}
      />,
    );

    expect(screen.getByText('Informe o nome do solicitante.')).toBeInTheDocument();
  });
});
